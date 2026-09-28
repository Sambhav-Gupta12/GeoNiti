import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getRecommendations } from './controller';

const router = Router();

// Recommend route
router.get('/', authenticate, getRecommendations);

export default router;
