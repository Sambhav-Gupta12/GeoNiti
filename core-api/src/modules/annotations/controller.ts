import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db';

const annotationSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().uuid(),
  content: z.string().min(1)
});

export async function createAnnotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = annotationSchema.parse(req.body);
    const userId = req.user!.id;
    
    // Create annotation
    const dbRes = await pool.query(`
      INSERT INTO annotations (user_id, entity_type, entity_id, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, payload.entity_type, payload.entity_id, payload.content]);
    
    res.status(201).json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getAnnotations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entity_type, entity_id } = req.query;
    
    let query = `
      SELECT a.*, u.first_name, u.last_name 
      FROM annotations a 
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (entity_type) {
      params.push(entity_type);
      query += ` AND a.entity_type = $${params.length}`;
    }
    
    if (entity_id) {
      params.push(entity_id);
      query += ` AND a.entity_id = $${params.length}`;
    }
    
    query += ` ORDER BY a.created_at DESC`;
    
    const dbRes = await pool.query(query, params);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}
