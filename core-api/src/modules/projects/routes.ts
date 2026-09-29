import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { listProjects, createProject, getProject, updateProject, deleteProject, addProjectItem, deleteProjectItem, exportProject } from './controller';

const router = Router();

router.get('/', authenticate, listProjects);
router.post('/', authenticate, createProject);
router.get('/:id', authenticate, getProject);
router.patch('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

router.post('/:id/items', authenticate, addProjectItem);
router.delete('/:id/items/:itemId', authenticate, deleteProjectItem);

router.get('/:id/export', authenticate, exportProject);

export default router;
