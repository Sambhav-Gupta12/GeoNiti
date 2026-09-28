import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { pool } from '../../db';

const router = Router();

router.get('/summary', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.role ?? 'public';
    const visibilities = getAllowedVisibilities(role);
    const statuses = getAllowedStatuses(role);

    const docRes = await pool.query(`
      SELECT type, status, visibility, count(*) as cnt 
      FROM documents 
      WHERE visibility = ANY($1) AND status = ANY($2)
      GROUP BY type, status, visibility
    `, [visibilities, statuses]);

    const dsRes = await pool.query(`
      SELECT status, visibility, count(*) as cnt 
      FROM datasets 
      WHERE visibility = ANY($1) AND status = ANY($2)
      GROUP BY status, visibility
    `, [visibilities, statuses]);

    res.json({
      data: {
        documents: docRes.rows,
        datasets: dsRes.rows,
      },
      meta: null,
      error: null
    });
  } catch (err) { next(err); }
});

export default router;
