import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { pool } from './db';
import authRoutes from './modules/auth/routes';
import adminUsersRoutes from './modules/admin/users/routes';
import adminReindexRoutes from './modules/admin/reindex/routes';
import searchRoutes from './modules/search/routes';
import assistantRoutes from './modules/assistant/routes';
import documentRoutes from './modules/documents/routes';
import datasetRoutes from './modules/datasets/routes';
import repositoryRoutes from './modules/repository/routes';
import recommendationsRoutes from './modules/recommendations/routes';
import regionsRoutes from './modules/regions/routes';
import layersRoutes from './modules/layers/routes';
import analyticsRoutes from './modules/analytics/routes';
import scenariosRoutes from './modules/scenarios/routes';
import projectsRoutes from './modules/projects/routes';
import annotationsRoutes from './modules/annotations/routes';
import graphRoutes from './modules/graph/routes';
import notificationsRoutes from './modules/notifications/routes';
import challengesRoutes from './modules/challenges/routes';
import adminRoutes from './modules/admin/routes';
import publicRoutes from './modules/public/routes';

const logger = pino();
const app = express();

app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Request ID & Logger
app.use((req, _res, next) => {
  req.id = randomUUID();
  next();
});
app.use(pinoHttp({ logger, genReqId: req => req.id }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/users', adminUsersRoutes);
app.use('/api/v1/admin', adminReindexRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/repository', repositoryRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/regions', regionsRoutes);
app.use('/api/v1/layers', layersRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/scenarios', scenariosRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/annotations', annotationsRoutes);
app.use('/api/v1/graph', graphRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/challenges', challengesRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);

// OpenAPI
app.get('/api/v1/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'BhuNiti Core API', version: '1.0.0' },
    paths: {
      '/api/v1/public/overview': { get: { responses: { '200': { description: 'OK' } } } },
      '/api/v1/admin/queue': { get: { responses: { '200': { description: 'OK' } } } }
    }
  });
});

// Health check with live DB ping
app.get('/api/v1/health', async (_req, res) => {
  let dbStatus = 'error';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unreachable';
  }
  res.json({ data: { service: 'healthy', db: dbStatus }, meta: null, error: null });
});

app.use(errorHandler);

const PORT = parseInt(config.PORT, 10);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Core API listening on port ${PORT}`);
  });
}

export default app; // exported for testing
