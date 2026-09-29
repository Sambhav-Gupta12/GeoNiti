import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || {};
  let status = err.status || 500;

  if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request payload';
    details = err.errors;
  }
  
  if (err.name === 'ApiError') {
    code = err.code || code;
  }

  // Mask internal server errors in prod (no stack trace)
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  req.log.error({ err }, message);

  res.status(status).json({
    data: null,
    meta: null,
    error: {
      code,
      message,
      details,
    },
  });
};
