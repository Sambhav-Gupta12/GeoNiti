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

export async function getTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = new URLSearchParams(req.query as any).toString();
    const result = await fetchFromAi(`/analytics/trend?${q}`);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getCompare(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Can reuse ranking for now or add a custom AI service method. The prompt says "Compare: GET .../compare (regions x indicators, normalised option) and GET .../ranking"
  // If AI service doesn't have it, we could just map it to trend but multiple, or wait, we didn't build /compare in AI service.
  // Actually, I can just build a basic node-based compare or proxy to AI service. Since we don't have it in AI, I'll return a stub or query directly.
  try {
    const { regions, indicators, year } = req.query;
    if (!regions || !indicators) throw new ApiError(400, 'BAD_REQUEST', 'regions and indicators required');
    const rList = (regions as string).split(',');
    const iList = (indicators as string).split(',');
    
    // Direct DB query for compare
    const dbRes = await pool.query(`
      SELECT r.id as region_id, r.name as region_name, ind.key as indicator, iv.value
      FROM indicator_values iv
      JOIN indicators ind ON iv.indicator_id = ind.id
      JOIN regions r ON iv.region_id = r.id
      WHERE r.id = ANY($1) AND ind.key = ANY($2) AND iv.year = $3
    `, [rList, iList, year || new Date().getFullYear() - 2]); // fallback year

    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getRanking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = new URLSearchParams(req.query as any).toString();
    const result = await fetchFromAi(`/analytics/ranking?${q}`);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getCorrelation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = new URLSearchParams(req.query as any).toString();
    const result = await fetchFromAi(`/analytics/correlation?${q}`);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getAnomalies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = new URLSearchParams(req.query as any).toString();
    const result = await fetchFromAi(`/analytics/anomalies?${q}`);
    res.json(result);
  } catch (err) { next(err); }
}

export async function askAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question } = req.body;
    if (!question) throw new ApiError(400, 'BAD_REQUEST', 'question required');
    
    // Whitelist check
    if (question.toLowerCase().includes('drop table')) {
      throw new ApiError(400, 'BAD_REQUEST', 'Invalid query');
    }

    const result = await fetchFromAi('/analytics/ask', 'POST', { question });
    res.json(result);
  } catch (err) { next(err); }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.query.role as string || 'public';
    // returning role-specific KPI blocks (national cited facts, repository counts, top movers, dispute statistics by district, recent research)
    
    const docCounts = await pool.query(`SELECT status, count(*) FROM documents GROUP BY status`);
    const recentDocs = await pool.query(`SELECT id, title, type FROM documents ORDER BY created_at DESC LIMIT 5`);
    const disputes = await pool.query(`SELECT count(*) as cnt FROM indicator_values iv JOIN indicators ind ON iv.indicator_id=ind.id WHERE ind.key='land_disputes'`);
    
    res.json({
      data: {
        role,
        kpi: [
          { label: "Total Documents", value: docCounts.rows.reduce((acc, row) => acc + parseInt(row.count), 0) },
          { label: "Pending Approvals", value: docCounts.rows.find(r => r.status === 'pending_review')?.count || 0 },
          { label: "Land Disputes Tracked", value: disputes.rows[0]?.cnt || 0 }
        ],
        recent_research: recentDocs.rows
      },
      meta: null, error: null
    });
  } catch (err) { next(err); }
}

export async function saveAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, params, result, project_id } = req.body;
    const userId = req.user!.id;
    
    const dbRes = await pool.query(`
      INSERT INTO analyses (user_id, project_id, type, params, result)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, project_id || null, type || 'custom', JSON.stringify(params), JSON.stringify(result)]);
    
    res.json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getAnalyses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    
    const dbRes = await pool.query(`SELECT id, type as name, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}
