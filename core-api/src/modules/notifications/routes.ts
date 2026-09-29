import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getNotifications, updateNotification } from './controller';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id', authenticate, updateNotification);

export default router;
