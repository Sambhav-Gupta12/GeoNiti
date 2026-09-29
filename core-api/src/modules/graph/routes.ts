import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { getGraph, createLink, deleteLink } from './controller';

const router = Router();

router.get('/', authenticate, getGraph);
router.post('/evidence-links', authenticate, requirePermission('document:create'), createLink);
router.delete('/evidence-links/:id', authenticate, requirePermission('document:create'), deleteLink);

export default router;
