import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { loginRateLimiter } from '../../middleware/rateLimiter';
import { login, logout, me, permissions, refresh } from './controller';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', loginRateLimiter, login);

// POST /api/v1/auth/refresh
router.post('/refresh', refresh);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, logout);

// GET  /api/v1/auth/me
router.get('/me', authenticate, me);

// GET  /api/v1/auth/permissions
router.get('/permissions', authenticate, permissions);

export default router;
