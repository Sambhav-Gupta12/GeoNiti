import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createAnnotation, getAnnotations } from './controller';

const router = Router();

router.post('/', authenticate, createAnnotation);
router.get('/', authenticate, getAnnotations);

export default router;
