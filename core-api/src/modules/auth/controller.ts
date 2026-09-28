import { Request, Response, NextFunction } from 'express';
import { loginSchema } from './schema';
import {
  validateLogin,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  findUserById,
} from './service';
import { getPermissions } from '../../config/permissions';
import { writeAuditEvent } from '../../services/audit';
import { ApiError } from '../../types';

const REFRESH_COOKIE = 'bhuniti_refresh';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await validateLogin(email, password);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);

    // Fire-and-forget audit
    void writeAuditEvent(user, 'user.login', 'user', user.id, { method: 'password' }, req.ip);

    res.json({
      data: { accessToken, user: { id: user.id, email: user.email, role: user.role, orgId: user.orgId } },
      meta: null,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new ApiError(401, 'MISSING_TOKEN', 'No refresh token.');

    const payload = verifyRefreshToken(token);
    const user = await findUserById(payload.sub);
    if (!user || !user.is_active) throw new ApiError(401, 'INVALID_TOKEN', 'User not found or inactive.');

    const authUser = { id: user.id, email: user.email, role: user.role_name, orgId: user.organization_id };
    const accessToken = signAccessToken(authUser);
    const newRefresh = signRefreshToken(user.id);

    res.cookie(REFRESH_COOKIE, newRefresh, COOKIE_OPTS);
    res.json({ data: { accessToken }, meta: null, error: null });
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response): void {
  void writeAuditEvent(req.user, 'user.logout', 'user', req.user?.id, {}, req.ip);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.json({ data: { message: 'Logged out.' }, meta: null, error: null });
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    const user = await findUserById(req.user.id);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
    res.json({
      data: { id: user.id, email: user.email, role: user.role_name, orgId: user.organization_id },
      meta: null, error: null,
    });
  } catch (err) {
    next(err);
  }
}

export function permissions(req: Request, res: Response): void {
  const role = req.user?.role ?? 'public';
  res.json({ data: { role, permissions: getPermissions(role) }, meta: null, error: null });
}
