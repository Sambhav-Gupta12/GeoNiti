import { Request, Response, NextFunction } from 'express';
import { pool } from '../../db';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const dbRes = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [userId]);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function updateNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const userId = req.user!.id;
    
    const dbRes = await pool.query(`
      UPDATE notifications SET is_read = $1 
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [is_read, id, userId]);
    
    res.json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}
