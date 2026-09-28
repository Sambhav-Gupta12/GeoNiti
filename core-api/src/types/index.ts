import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  orgId: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  orgId: string | null;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user: AuthUser | null;
      id: string;
    }
  }
}

export type { Request };
