import { pool } from '../../db';
import { ApiError } from '../../types';
import { ListDatasetsQuery } from './schema';
import { Visibility } from '../../config/permissions';
import { v4 as uuid } from 'uuid';

export async function listDatasets(
  q: ListDatasetsQuery,
  allowedVisibilities: Visibility[],
  allowedStatuses: string[]
) {
  const whereArgs: unknown[] = [];
  const whereClauses: string[] = [];

  whereArgs.push(allowedVisibilities);
  whereClauses.push(`visibility = ANY($${whereArgs.length})`);
  whereArgs.push(allowedStatuses);
  whereClauses.push(`status = ANY($${whereArgs.length})`);

  if (q.status && allowedStatuses.includes(q.status)) { whereArgs.push(q.status); whereClauses.push(`status = $${whereArgs.length}`); }
  if (q.organization) { whereArgs.push(q.organization); whereClauses.push(`organization_id = $${whereArgs.length}`); }
  if (q.region) { whereArgs.push(q.region); whereClauses.push(`coverage_region_id = $${whereArgs.length}`); }

  if (q.query) {
    whereArgs.push(`%${q.query}%`);
    whereClauses.push(`(title ILIKE $${whereArgs.length} OR description ILIKE $${whereArgs.length})`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sortCol = q.sort === 'title' ? 'title' : 'created_at';
  const orderStr = q.order === 'asc' ? 'ASC' : 'DESC';
  const limit = q.pageSize;
  const offset = (q.page - 1) * limit;

  const dataQuery = `
    SELECT id, title, description, organization_id, coverage_region_id, status, visibility, is_illustrative, created_at, update_frequency
    FROM datasets
    ${whereStr}
    ORDER BY ${sortCol} ${orderStr}
    LIMIT $${whereArgs.length + 1} OFFSET $${whereArgs.length + 2}
  `;
  const countQuery = `SELECT COUNT(*) FROM datasets ${whereStr}`;

  const [dataRes, countRes] = await Promise.all([
    pool.query(dataQuery, [...whereArgs, limit, offset]),
    pool.query(countQuery, whereArgs)
  ]);

  return {
    rows: dataRes.rows,
    total: parseInt(countRes.rows[0].count, 10),
  };
}

export async function getDatasetById(id: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  const { rows } = await pool.query(`
    SELECT * FROM datasets 
    WHERE id = $1 AND visibility = ANY($2) AND status = ANY($3)
  `, [id, allowedVisibilities, allowedStatuses]);

  if (!rows[0]) throw new ApiError(404, 'NOT_FOUND', 'Dataset not found.');
  return rows[0];
}

export async function getDatasetVersions(id: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  await getDatasetById(id, allowedVisibilities, allowedStatuses);
  const { rows } = await pool.query(`SELECT * FROM dataset_versions WHERE dataset_id=$1 ORDER BY created_at DESC`, [id]);
  return rows;
}

export async function createDataset(data: any) {
  const id = uuid();
  const { rows } = await pool.query(`
    INSERT INTO datasets(id, title, description, organization_id, coverage_region_id, time_start, time_end, update_frequency, license, visibility, is_illustrative, provenance_note, status)
    VALUES($1,$2,$3,$4,$5,$6::date,$7::date,$8,$9,$10,$11,$12,'pending_review')
    RETURNING *
  `, [
    id, data.title, data.description || null, data.organization_id || null, data.coverage_region_id || null,
    data.time_start || null, data.time_end || null, data.update_frequency || null, data.license || null,
    data.visibility, data.is_illustrative, data.provenance_note || null
  ]);
  return rows[0];
}

export async function createDatasetVersion(datasetId: string, data: any, filePath: string | null) {
  const id = uuid();
  const { rows } = await pool.query(`
    INSERT INTO dataset_versions(id, dataset_id, version, file_path, row_count, notes)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *
  `, [id, datasetId, data.version, filePath, data.row_count || null, data.notes || null]);
  
  await pool.query(`UPDATE datasets SET current_version_id=$1 WHERE id=$2`, [id, datasetId]);
  
  return rows[0];
}

export async function patchDataset(id: string, data: any, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  const ds = await getDatasetById(id, allowedVisibilities, allowedStatuses);
  
  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sets.push(`${key}=$${i++}`);
      vals.push(value === null ? null : value);
    }
  }

  if (sets.length === 0) return ds;
  
  sets.push(`updated_at=NOW()`);
  vals.push(id);

  const { rows } = await pool.query(`UPDATE datasets SET ${sets.join(', ')} WHERE id=$${i} RETURNING *`, vals);
  return rows[0];
}

export async function approveDataset(id: string, note: string | undefined, userId: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  await getDatasetById(id, allowedVisibilities, allowedStatuses);
  const { rows } = await pool.query(`
    UPDATE datasets SET status='approved',
    provenance_note = CASE WHEN $3::text IS NOT NULL THEN COALESCE(provenance_note, '') || '\nApproval note: ' || $3 ELSE provenance_note END
    WHERE id=$1 RETURNING *
  `, [id, userId, note || null]); // No approved_by in schema, just use note
  return rows[0];
}

export async function rejectDataset(id: string, note: string | undefined, userId: string, allowedVisibilities: Visibility[], allowedStatuses: string[]) {
  await getDatasetById(id, allowedVisibilities, allowedStatuses);
  const { rows } = await pool.query(`
    UPDATE datasets SET status='rejected',
    provenance_note = CASE WHEN $3::text IS NOT NULL THEN COALESCE(provenance_note, '') || '\nRejection note: ' || $3 ELSE provenance_note END
    WHERE id=$1 RETURNING *
  `, [id, userId, note || null]);
  return rows[0];
}
