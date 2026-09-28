import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { ApiError } from '../types';

export const loginRateLimiter = rateLimit({
  windowMs: parseInt(config.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(config.RATE_LIMIT_MAX, 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'RATE_LIMITED', 'Too many login attempts. Please try again later.'));
  },
});
