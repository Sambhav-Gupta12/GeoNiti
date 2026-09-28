import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getTrend, getCompare, getRanking, getCorrelation, getAnomalies, askAnalytics, getDashboard, saveAnalysis, getAnalyses } from './controller';

const router = Router();

router.get('/trend', authenticate, getTrend);
router.get('/compare', authenticate, getCompare);
router.get('/ranking', authenticate, getRanking);
router.get('/correlation', authenticate, getCorrelation);
router.get('/anomalies', authenticate, getAnomalies);
router.post('/ask', authenticate, askAnalytics);
router.get('/dashboard', authenticate, getDashboard);

router.post('/analyses', authenticate, saveAnalysis);
router.get('/analyses', authenticate, getAnalyses);

export default router;
