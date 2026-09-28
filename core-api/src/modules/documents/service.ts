import { pool } from '../../db';
import { ApiError } from '../../types';
import { ListDocumentsQuery } from './schema';
import { Visibility } from '../../config/permissions';
import { v4 as uuid } from 'uuid';

export async function listDocuments(
  q: ListDocumentsQuery,
  allowedVisibilities: Visibility[],
  allowedStatuses: string[]
) {
  const whereArgs: unknown[] = [];
  const whereClauses: string[] = [];

  // Mandatory RBAC filters
  whereArgs.push(allowedVisibilities);
  whereClauses.push(`visibility = ANY($${whereArgs.length})`);
  whereArgs.push(allowedStatuses);
  whereClauses.push(`status = ANY($${whereArgs.length})`);

  // Optional filters
  if (q.type) { whereArgs.push(q.type); whereClauses.push(`type = $${whereArgs.length}`); }
  if (q.status && allowedStatuses.includes(q.status)) { whereArgs.push(q.status); whereClauses.push(`status = $${whereArgs.length}`); }
  if (q.year_from) { whereArgs.push(q.year_from); whereClauses.push(`year >= $${whereArgs.length}`); }
  if (q.year_to) { whereArgs.push(q.year_to); whereClauses.push(`year <= $${whereArgs.length}`); }
  if (q.organization) { whereArgs.push(q.organization); whereClauses.push(`organization_id = $${whereArgs.length}`); }
  if (q.topic) { whereArgs.push(q.topic); whereClauses.push(`$${whereArgs.length} = ANY(topics)`); }
  if (q.keyword) { whereArgs.push(q.keyword); whereClauses.push(`$${whereArgs.length} = ANY(keywords)`); }
  
  if (q.region) {
    whereArgs.push(q.region);
    whereClauses.push(`EXISTS (SELECT 1 FROM document_regions dr WHERE dr.document_id = documents.id AND dr.region_id = $${whereArgs.length})`);
  }

  if (q.query) {
    // Basic text search over title, abstract using ilike
    whereArgs.push(`%${q.query}%`);
    whereClauses.push(`(title ILIKE $${whereArgs.length} OR abstract ILIKE $${whereArgs.length})`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  
  const sortCol = q.sort === 'year' ? 'year' : q.sort === 'title' ? 'title' : 'created_at';
  const orderStr = q.order === 'asc' ? 'ASC' : 'DESC';

  const limit = q.pageSize;
  const offset = (q.page - 1) * limit;

  const dataQuery = `
    SELECT id, type, title, abstract, year, status, visibility, is_illustrative, created_at, organization_id
    FROM documents
    ${whereStr}
    ORDER BY ${sortCol} ${orderStr}
    LIMIT $${whereArgs.length + 1} OFFSET $${whereArgs.length + 2}
  `;
  const countQuery = `SELECT COUNT(*) FROM documents ${whereStr}`;

  const [dataRes, countRes] = await Promise.all([
    pool.query(dataQuery, [...whereArgs, limit, offset]),
    pool.query(countQuery, whereArgs)
  ]);

  // Facets
  const facetsQuery = `
    SELECT 
      (SELECT json_object_agg(type, cnt) FROM (SELECT type, count(*) as cnt FROM documents ${whereStr} GROUP BY type) t) as type_counts,
      (SELECT json_object_agg(status, cnt) FROM (SELECT status, count(*) as cnt FROM documents ${whereStr} GROUP BY status) t) as status_counts,
      (SELECT json_object_agg(topic, cnt) FROM (SELECT unnest(topics) as topic, count(*) as cnt FROM documents ${whereStr} GROUP BY topic) t) as topic_counts
  `;
  const facetsRes = await pool.query(facetsQuery, whereArgs);

  return {
    rows: dataRes.rows,
    total: parseInt(countRes.rows[0].count, 10),
    facets: facetsRes.rows[0]
  };
}

export async function getDocumentById(id: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  const { rows } = await pool.query(`
    SELECT * FROM documents 
    WHERE id = $1 AND visibility = ANY($2) AND status = ANY($3)
  `, [id, allowedVisibilities, allowedStatuses]);

  if (!rows[0]) throw new ApiError(404, 'NOT_FOUND', 'Document not found.');
  return rows[0];
}

export async function createDocument(data: any, filePath: string | null) {
  const id = uuid();
  const authors = data.authors ? JSON.parse(data.authors) : [];
  const keywords = data.keywords ? JSON.parse(data.keywords) : [];
  const topics = data.topics ? JSON.parse(data.topics) : [];
  const regions = data.regions ? JSON.parse(data.regions) : [];

  const { rows } = await pool.query(`
    INSERT INTO documents(id, type, title, abstract, authors, organization_id, year, source_url, file_path, language, keywords, topics, visibility, is_illustrative, provenance_note, status)
    VALUES($1,$2,$3,$4,$5::text[],$6,$7,$8,$9,$10,$11::text[],$12::text[],$13,$14,$15,'pending_review')
    RETURNING *
  `, [
    id, data.type, data.title, data.abstract, authors, data.organization_id || null, data.year, data.source_url || null, filePath, data.language, keywords, topics, data.visibility, data.is_illustrative, data.provenance_note || null
  ]);

  for (const regionId of regions) {
    await pool.query(`INSERT INTO document_regions(document_id, region_id) VALUES($1,$2)`, [id, regionId]);
  }

  return rows[0];
}

export async function patchDocument(id: string, data: any, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  const doc = await getDocumentById(id, allowedVisibilities, allowedStatuses);
  
  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sets.push(`${key}=$${i++}`);
      vals.push(Array.isArray(value) ? value : (value === null ? null : value)); // simplified
    }
  }

  if (sets.length === 0) return doc;
  
  sets.push(`updated_at=NOW()`);
  vals.push(id);

  const { rows } = await pool.query(`UPDATE documents SET ${sets.join(', ')} WHERE id=$${i} RETURNING *`, vals);
  return rows[0];
}

export async function approveDocument(id: string, note: string | undefined, userId: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  await getDocumentById(id, allowedVisibilities, allowedStatuses);
  const { rows } = await pool.query(`
    UPDATE documents SET status='approved', approved_by=$2, updated_at=NOW(),
    provenance_note = CASE WHEN $3::text IS NOT NULL THEN COALESCE(provenance_note, '') || '\nApproval note: ' || $3 ELSE provenance_note END
    WHERE id=$1 RETURNING *
  `, [id, userId, note || null]);
  return rows[0];
}

export async function rejectDocument(id: string, note: string | undefined, userId: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  await getDocumentById(id, allowedVisibilities, allowedStatuses);
  const { rows } = await pool.query(`
    UPDATE documents SET status='rejected', updated_at=NOW(),
    provenance_note = CASE WHEN $3::text IS NOT NULL THEN COALESCE(provenance_note, '') || '\nRejection note: ' || $3 ELSE provenance_note END
    WHERE id=$1 RETURNING *
  `, [id, userId, note || null]);
  return rows[0];
}
