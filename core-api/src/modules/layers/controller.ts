import { Request, Response, NextFunction } from 'express';
import { pool } from '../../db';
import { ApiError } from '../../types';

export async function getLayers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT key, name, category, source, resolution_note, is_illustrative, style 
      FROM geo_layers
    `);
    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getLayerData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const { year } = req.query;

    // For the demo, layers derive data from indicators using the same key.
    // e.g. layer "population_density" reads from indicator "population_density"
    
    let query = '';
    const params: any[] = [key];
    
    if (year) {
      params.push(year);
      query = `
        SELECT iv.region_id as id, r.name, iv.value 
        FROM indicator_values iv
        JOIN indicators ind ON iv.indicator_id = ind.id
        JOIN regions r ON iv.region_id = r.id
        WHERE ind.key = $1 AND iv.year = $2
      `;
    } else {
      // Get the latest available year
      query = `
        WITH Latest AS (
          SELECT iv.region_id, iv.value,
                 RANK() OVER(PARTITION BY iv.region_id ORDER BY iv.year DESC) as rnk
          FROM indicator_values iv
          JOIN indicators ind ON iv.indicator_id = ind.id
          WHERE ind.key = $1
        )
        SELECT l.region_id as id, r.name, l.value 
        FROM Latest l
        JOIN regions r ON l.region_id = r.id
        WHERE l.rnk = 1
      `;
    }
    
    const result = await pool.query(query, params);
    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}
