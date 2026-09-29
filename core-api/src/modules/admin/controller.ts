import { Request, Response, NextFunction } from 'express';
import { pool } from '../../db';
import { config } from '../../config';
import { ApiError } from '../../types';
import { z } from 'zod';

export async function getApprovalQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const docs = await pool.query(`
      SELECT 'document' as entity_type, id, title, status, extracted_metadata, created_at,
             EXTRACT(DAY FROM NOW() - created_at) as age_days
      FROM documents WHERE status = 'pending_review'
    `);
    
    const datasets = await pool.query(`
      SELECT 'dataset' as entity_type, id, title, status, NULL as extracted_metadata, created_at,
             EXTRACT(DAY FROM NOW() - created_at) as age_days
      FROM datasets WHERE status = 'pending_review'
    `);
    
    res.json({ data: [...docs.rows, ...datasets.rows], meta: null, error: null });
  } catch (err) { next(err); }
}

const bulkQueueSchema = z.object({
  items: z.array(z.object({
    entity_type: z.enum(['document', 'dataset']),
    id: z.string().uuid()
  })),
  note: z.string().optional()
});

async function triggerIngestion(docId: string, token: string) {
  // Call AI Service ingestion endpoint (we implemented /metadata/extract but for ingestion we have POST /metadata/ingest ... wait, B5 says POST /reindex exists or POST /documents/:id/ingest)
  // According to B4: POST /api/v1/documents/:id/approve triggers ingestion.
  // We'll just proxy the reindex call here, or post to ai-service directly.
  try {
    await fetch(`${config.AI_SERVICE_URL.replace(/\/$/, '')}/reindex`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.AI_SERVICE_KEY}` }
    });
  } catch (e) {
    console.error('Failed to trigger AI ingestion', e);
  }
}

export async function bulkApprove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, note } = bulkQueueSchema.parse(req.body);
    const userId = req.user!.id;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        const table = item.entity_type === 'document' ? 'documents' : 'datasets';
        await client.query(`UPDATE ${table} SET status = 'approved', updated_at = NOW() WHERE id = $1`, [item.id]);
        
        await client.query(`
          INSERT INTO audit_events (actor_id, action, entity_type, entity_id, meta)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, `${item.entity_type}:approve`, item.entity_type, item.id, JSON.stringify({ note })]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    
    // Trigger ingestion asynchronously
    triggerIngestion('all', req.token as string).catch(console.error);
    
    res.json({ data: { success: true, count: items.length }, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function bulkReject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, note } = bulkQueueSchema.parse(req.body);
    const userId = req.user!.id;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        const table = item.entity_type === 'document' ? 'documents' : 'datasets';
        await client.query(`UPDATE ${table} SET status = 'rejected', updated_at = NOW() WHERE id = $1`, [item.id]);
        
        await client.query(`
          INSERT INTO audit_events (actor_id, action, entity_type, entity_id, meta)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, `${item.entity_type}:reject`, item.entity_type, item.id, JSON.stringify({ note })]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    
    res.json({ data: { success: true, count: items.length }, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { actor, action, entity, date_from, date_to } = req.query;
    
    let query = `SELECT * FROM audit_events WHERE 1=1`;
    const params: any[] = [];
    
    if (actor) { params.push(actor); query += ` AND actor_id = $${params.length}`; }
    if (action) { params.push(action); query += ` AND action = $${params.length}`; }
    if (entity) { params.push(entity); query += ` AND entity_type = $${params.length}`; }
    if (date_from) { params.push(date_from); query += ` AND created_at >= $${params.length}`; }
    if (date_to) { params.push(date_to); query += ` AND created_at <= $${params.length}`; }
    
    query += ` ORDER BY created_at DESC LIMIT 100`;
    
    const dbRes = await pool.query(query, params);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function exportAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Basic CSV export
    const dbRes = await pool.query(`SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 1000`);
    
    let csv = 'id,actor_id,action,entity_type,entity_id,created_at\n';
    for (const row of dbRes.rows) {
      csv += `${row.id},${row.actor_id},${row.action},${row.entity_type},${row.entity_id},${row.created_at.toISOString()}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_export.csv"');
    res.send(csv);
  } catch (err) { next(err); }
}

export async function getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // check DB
    await pool.query('SELECT 1');
    
    // check AI service
    let aiHealth = { status: 'unreachable' };
    try {
      const resp = await fetch(`${config.AI_SERVICE_URL.replace(/\/$/, '')}/health`);
      aiHealth = await resp.json();
    } catch(e) {}
    
    const chunks = await pool.query(`SELECT count(*) FROM document_chunks`);
    
    res.json({
      data: {
        db: 'connected',
        ai_service: aiHealth,
        stats: {
          chunk_count: parseInt(chunks.rows[0].count)
        }
      },
      meta: null, error: null
    });
  } catch (err) { next(err); }
}

export async function reindexSystem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resp = await fetch(`${config.AI_SERVICE_URL.replace(/\/$/, '')}/reindex`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.AI_SERVICE_KEY}` }
    });
    if (!resp.ok) throw new Error('AI Service failed to reindex');
    res.json({ data: { success: true }, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getIntegrations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({
      data: [
        { name: 'Repository Search', endpoint: '/api/v1/documents', docs: '/api/v1/docs' },
        { name: 'GIS Vector Tiles', endpoint: '/api/v1/regions/geojson', docs: '/api/v1/docs' },
        { name: 'Analytics API', endpoint: '/api/v1/analytics', docs: '/api/v1/docs' }
      ],
      meta: null, error: null
    });
  } catch (err) { next(err); }
}
