import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate';
import { requirePermission } from '../../../middleware/requirePermission';
import { getUsers, getUser, updateUser } from './controller';

const router = Router();

router.use(authenticate, requirePermission('admin:users'));

// GET  /api/v1/admin/users
router.get('/', getUsers);

// GET  /api/v1/admin/users/:id
router.get('/:id', getUser);

// PATCH /api/v1/admin/users/:id
router.patch('/:id', updateUser);

export default router;
