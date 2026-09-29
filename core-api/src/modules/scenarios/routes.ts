import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { getParameters, runScenario, getRuns, getRunById, compareRuns } from './controller';

const router = Router();

router.get('/parameters', authenticate, getParameters);
router.post('/run', authenticate, requirePermission('scenario:run'), runScenario);
router.get('/runs', authenticate, getRuns);
router.get('/runs/:id', authenticate, getRunById);
router.post('/compare', authenticate, compareRuns);

export default router;
