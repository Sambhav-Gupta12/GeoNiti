import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db';
import { config } from '../../config';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { writeAuditEvent } from '../../services/audit';
import { ApiError } from '../../types';

const searchSchema = z.object({
  q: z.string().min(1),
  mode: z.enum(['semantic', 'keyword', 'hybrid']).default('hybrid'),
  limit: z.coerce.number().min(1).max(50).default(20),
  types: z.string().optional(),
  topics: z.string().optional(),
  region_ids: z.string().optional(),
  year_from: z.coerce.number().optional(),
  year_to: z.coerce.number().optional(),
  organization_ids: z.string().optional(),
});

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = searchSchema.parse(req.query);
    const role = req.user?.role ?? 'public';
    const allowed_visibility = getAllowedVisibilities(role);
    const allowed_status = getAllowedStatuses(role);

    // Build filters
    const filters: Record<string, any> = {};
    if (query.types) filters.types = query.types.split(',');
    if (query.topics) filters.topics = query.topics.split(',');
    if (query.region_ids) filters.region_ids = query.region_ids.split(',');
    if (query.year_from) filters.year_from = query.year_from;
    if (query.year_to) filters.year_to = query.year_to;
    if (query.organization_ids) filters.organization_ids = query.organization_ids.split(',');

    const payload = {
      query: query.q,
      filters,
      mode: query.mode,
      limit: query.limit,
      caller_context: {
        role,
        allowed_visibility,
        allowed_status
      }
    };

    const aiServiceUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    const aiRes = await fetch(`${aiServiceUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.AI_SERVICE_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      throw new ApiError(aiRes.status, 'AI_SERVICE_ERROR', text);
    }

    const data = await aiRes.json();

    void writeAuditEvent(req.user, 'search', 'system', 'search', { query: query.q, mode: query.mode, filters }, req.ip);

    res.json({ data, meta: null, error: null });
  } catch (err) { next(err); }
}

const savedSearchSchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
  filters: z.record(z.any()).optional().default({}),
});

export async function saveSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    const data = savedSearchSchema.parse(req.body);

    const result = await pool.query(`
      INSERT INTO saved_searches (user_id, name, query, filters)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, data.name, data.query, JSON.stringify(data.filters)]);

    res.json({ data: result.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getSavedSearches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    
    const result = await pool.query(`
      SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY id DESC
    `, [req.user.id]);

    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function deleteSavedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    
    const result = await pool.query(`
      DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING id
    `, [req.params.id, req.user.id]);

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Saved search not found or unauthorized');
    }

    res.json({ data: { id: req.params.id }, meta: null, error: null });
  } catch (err) { next(err); }
}
