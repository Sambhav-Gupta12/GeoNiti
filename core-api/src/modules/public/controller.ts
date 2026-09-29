import { Request, Response, NextFunction } from 'express';
import { pool } from '../../db';

export async function getPublicOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const docsCount = await pool.query(`SELECT count(*) FROM documents WHERE status = 'approved' AND visibility = 'public'`);
    const datasetsCount = await pool.query(`SELECT count(*) FROM datasets WHERE status = 'approved' AND visibility = 'public'`);
    const challengesCount = await pool.query(`SELECT count(*) FROM challenges WHERE status = 'open'`);
    
    // Get some sample regions and indicators
    const sampleIndicators = await pool.query(`
      SELECT i.key, i.name, avg(iv.value) as avg_value
      FROM indicators i
      JOIN indicator_values iv ON i.id = iv.indicator_id
      GROUP BY i.key, i.name
      LIMIT 3
    `);
    
    res.json({
      data: {
        counts: {
          documents: parseInt(docsCount.rows[0].count),
          datasets: parseInt(datasetsCount.rows[0].count),
          challenges: parseInt(challengesCount.rows[0].count)
        },
        highlights: sampleIndicators.rows
      },
      meta: null,
      error: null
    });
  } catch (err) { next(err); }
}
