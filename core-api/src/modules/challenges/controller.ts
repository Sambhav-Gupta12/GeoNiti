import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db';

export async function getChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, status } = req.query;
    let query = `SELECT * FROM challenges WHERE 1=1`;
    const params: any[] = [];
    
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    query += ` ORDER BY created_at DESC`;
    const dbRes = await pool.query(query, params);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getChallengeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dbRes = await pool.query(`
      SELECT type, status, count(*) as count
      FROM challenges
      GROUP BY type, status
    `);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getChallengeById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const dbRes = await pool.query(`SELECT * FROM challenges WHERE id = $1`, [id]);
    if (dbRes.rows.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

const challengeSchema = z.object({
  type: z.enum(['hackathon','grant','pilot','competition']),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['open','closed','draft']).default('open'),
  deadline: z.string().optional(),
  org_id: z.string().uuid().optional()
});

export async function createChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = challengeSchema.parse(req.body);
    const userId = req.user!.id;
    
    const dbRes = await pool.query(`
      INSERT INTO challenges (type, title, description, status, deadline, org_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [payload.type, payload.title, payload.description || null, payload.status, payload.deadline || null, payload.org_id || null, userId]);
    
    res.status(201).json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function updateChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    const dbRes = await pool.query(`
      UPDATE challenges SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        deadline = COALESCE($5, deadline),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, payload.title, payload.description, payload.status, payload.deadline]);
    
    if (dbRes.rows.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function registerInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    await pool.query(`
      INSERT INTO challenge_interests (challenge_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [id, userId]);
    
    res.json({ data: { success: true }, meta: null, error: null });
  } catch (err) { next(err); }
}
