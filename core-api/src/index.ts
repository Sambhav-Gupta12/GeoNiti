import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

const logger = pino();
const app = express();

app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json());

// Request ID & Logger
app.use((req, res, next) => {
  // @ts-ignore
  req.id = randomUUID();
  next();
});
app.use(pinoHttp({ logger, genReqId: req => (req as any).id }));

app.get('/api/v1/health', (req, res) => {
  res.json({
    data: {
      service: 'healthy',
      db: 'connected', // Mock for now
    },
    meta: null,
    error: null,
  });
});

app.use(errorHandler);

const PORT = parseInt(config.PORT, 10);
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Core API listening on port ${PORT}`);
});
