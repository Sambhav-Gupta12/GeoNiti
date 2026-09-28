import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

/**
 * Optionally authenticates the request. Populates req.user if a valid Bearer token is present.
 * Never rejects unauthenticated requests — use requirePermission for that.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  req.user = null;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    if (payload.type !== 'access') return next();
    req.user = { id: payload.sub, email: payload.email, role: payload.role, orgId: payload.orgId };
  } catch {
    // Expired or invalid — treat as guest
  }
  next();
}
