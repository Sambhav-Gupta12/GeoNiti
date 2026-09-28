import { Request, Response, NextFunction } from 'express';
import { hasPermission, Action } from '../config/permissions';
import { ApiError } from '../types';

/**
 * Gate a route to users who have the given permission.
 * Guests (req.user = null) are treated as role 'public'.
 */
export function requirePermission(action: Action) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role ?? 'public';
    if (!hasPermission(role, action)) {
      return next(
        req.user
          ? new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.')
          : new ApiError(401, 'UNAUTHORIZED', 'Authentication required.'),
      );
    }
    next();
  };
}
