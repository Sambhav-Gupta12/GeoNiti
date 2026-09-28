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
import documentRoutes from './modules/documents/routes';
import datasetRoutes from './modules/datasets/routes';
import repositoryRoutes from './modules/repository/routes';

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
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/repository', repositoryRoutes);

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
