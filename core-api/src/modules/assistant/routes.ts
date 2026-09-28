import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createSession, getSessions, getSession, postMessage } from './controller';

const router = Router();

// All assistant routes require authentication
router.use(authenticate);

router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.post('/sessions/:id/messages', postMessage);

export default router;
