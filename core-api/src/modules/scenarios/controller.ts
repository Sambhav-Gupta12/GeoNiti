import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from '../../config';
import { pool } from '../../db';
import { ApiError } from '../../types';

async function fetchFromAi(path: string, method: string = 'GET', body: any = null) {
  const url = `${config.AI_SERVICE_URL.replace(/\/$/, '')}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${config.AI_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new ApiError(res.status, 'AI_SERVICE_ERROR', await res.text());
  }
  return res.json();
}

export async function getParameters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await fetchFromAi('/scenario/parameters');
    res.json(result);
  } catch (err) { next(err); }
}

const scenarioRunSchema = z.object({
  target_indicator: z.string().default('cropland_pct'),
  horizon: z.number().min(1).max(20).default(5),
  params: z.record(z.number()),
  title: z.string().optional(),
  description: z.string().optional()
});

export async function runScenario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = scenarioRunSchema.parse(req.body);
    const userId = req.user!.id;
    
    const result = await fetchFromAi('/scenario/run', 'POST', {
      target_indicator: payload.target_indicator,
      horizon: payload.horizon,
      params: payload.params
    });
    
    // Store in DB - create scenario and scenario_run
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const sRes = await client.query(`
        INSERT INTO scenarios (title, description, created_by)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [payload.title || `Scenario: ${payload.target_indicator}`, payload.description || '', userId]);
      const scenarioId = sRes.rows[0].id;
      
      const rRes = await client.query(`
        INSERT INTO scenario_runs (scenario_id, parameters, results, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [scenarioId, JSON.stringify(payload.params), JSON.stringify(result.data), userId]);
      
      // Audit event
      await client.query(`
        INSERT INTO audit_events (user_id, action, entity_type, entity_id)
        VALUES ($1, 'scenario:run', 'scenario', $2)
      `, [userId, scenarioId]);
      
      await client.query('COMMIT');
      
      res.json({ data: { run_id: rRes.rows[0].id, scenario_id: scenarioId, ...result.data }, meta: null, error: null });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
}

export async function getRuns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const dbRes = await pool.query(`
      SELECT sr.id, s.title, sr.created_at
      FROM scenario_runs sr
      JOIN scenarios s ON sr.scenario_id = s.id
      WHERE sr.created_by = $1
      ORDER BY sr.created_at DESC
    `, [userId]);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getRunById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const dbRes = await pool.query(`
      SELECT sr.*, s.title, s.description
      FROM scenario_runs sr
      JOIN scenarios s ON sr.scenario_id = s.id
      WHERE sr.id = $1
    `, [id]);
    
    if (dbRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Run not found');
    res.json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function compareRuns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { run_ids } = req.body;
    if (!Array.isArray(run_ids) || run_ids.length !== 2) {
      throw new ApiError(400, 'BAD_REQUEST', 'Need exactly 2 run_ids');
    }
    
    const dbRes = await pool.query(`
      SELECT sr.id, s.title, sr.parameters, sr.results
      FROM scenario_runs sr
      JOIN scenarios s ON sr.scenario_id = s.id
      WHERE sr.id = ANY($1)
    `, [run_ids]);
    
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}
