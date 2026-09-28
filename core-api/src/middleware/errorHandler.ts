import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || {};
  const status = err.status || 500;

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
