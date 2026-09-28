import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../db';
import { config } from '../../config';
import { ApiError, AuthUser, JwtPayload } from '../../types';

interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  role_name: string;
  organization_id: string | null;
  is_active: boolean;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    `SELECT u.id, u.email, u.password_hash, r.name AS role_name, u.organization_id, u.is_active
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    `SELECT u.id, u.email, u.password_hash, r.name AS role_name, u.organization_id, u.is_active
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export function signAccessToken(user: AuthUser): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
    orgId: user.orgId,
    type: 'access',
  };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: userId,
    email: '',
    role: '',
    orgId: null,
    type: 'refresh',
  };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): JwtPayload {
  const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'INVALID_TOKEN', 'Invalid token type.');
  }
  return payload;
}

export async function validateLogin(
  email: string,
  password: string,
): Promise<AuthUser> {
  const user = await findUserByEmail(email);
  // Use same error for not-found and wrong-password to prevent user enumeration
  const invalid = new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');

  if (!user || !user.is_active) throw invalid;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw invalid;

  return { id: user.id, email: user.email, role: user.role_name, orgId: user.organization_id };
}
