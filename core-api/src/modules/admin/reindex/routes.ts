import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/authenticate';
import { requirePermission } from '../../../middleware/requirePermission';
import { writeAuditEvent } from '../../../services/audit';
import { config } from '../../../config';

const router = Router();

router.post('/reindex', authenticate, requirePermission('admin:users'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const aiServiceUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    
    // Fire and forget so we don't block
    fetch(`${aiServiceUrl}/ingest/all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.AI_SERVICE_KEY}`
      }
    }).catch(e => console.error("Reindex job failed:", e));

    void writeAuditEvent(req.user, 'admin.reindex.started', 'system', 'reindex', {}, req.ip);

    res.json({
      data: { message: "Reindexing job started in the background." },
      meta: null,
      error: null
    });
  } catch (err) { next(err); }
});

export default router;
