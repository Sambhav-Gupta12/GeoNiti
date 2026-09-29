import { Router } from 'express';
import { getPublicOverview } from './controller';

const router = Router();

router.get('/overview', getPublicOverview);

export default router;
