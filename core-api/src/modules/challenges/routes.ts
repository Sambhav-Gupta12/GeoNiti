import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/authenticate';
import { getChallenges, getChallengeSummary, getChallengeById, createChallenge, updateChallenge, registerInterest } from './controller';

const router = Router();

router.get('/', getChallenges); // Public allowed to view
router.get('/summary', getChallengeSummary);
router.get('/:id', getChallengeById);

// Admin / Official
router.post('/', authenticate, requirePermission('admin:users'), createChallenge);
router.patch('/:id', authenticate, requirePermission('admin:users'), updateChallenge);

// Register interest (Auth required)
router.post('/:id/interest', authenticate, registerInterest);

export default router;
