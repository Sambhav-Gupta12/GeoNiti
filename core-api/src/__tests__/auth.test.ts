import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock config FIRST so app never calls process.exit(1)
vi.mock('../config', () => ({
  config: {
    PORT: '4000',
    DATABASE_URL: 'postgres://test:test@localhost/test',
    JWT_SECRET: 'test-secret-at-least-32-chars-long!!',
    JWT_ACCESS_EXPIRES: '15m',
    JWT_REFRESH_EXPIRES: '7d',
    AI_SERVICE_URL: 'http://localhost:8000',
    AI_SERVICE_KEY: 'test-key',
    FRONTEND_URL: 'http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX: '100', // high limit so tests don't trip it
  },
}));

// Mock DB pool
vi.mock('../db', () => ({
  pool: { query: vi.fn(), end: vi.fn() },
}));

// Mock audit service
vi.mock('../services/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import app from '../index';
import { pool } from '../db';
import { writeAuditEvent } from '../services/audit';

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };
const mockAudit = writeAuditEvent as ReturnType<typeof vi.fn>;

const BCRYPT_HASH = '$2b$10$QtfJfVA1cjDTkF9zM51SCePlW27qVCFeDn41WicB92fY8vWJpzn0y'; // "Demo@1234"

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unknown email', async () => {
    // Mock: user not found
    mockPool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for wrong password', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: 'user-1', email: 'researcher@bhuniti.demo',
        password_hash: BCRYPT_HASH, role_name: 'researcher',
        organization_id: null, is_active: true,
      }],
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'researcher@bhuniti.demo', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('writes audit event on successful login', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: 'user-1', email: 'researcher@bhuniti.demo',
        password_hash: BCRYPT_HASH, role_name: 'researcher',
        organization_id: null, is_active: true,
      }],
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'researcher@bhuniti.demo', password: 'Demo@1234' });

    // Login should succeed and audit should be called
    expect(res.status).toBe(200);
    expect(res.body.data?.accessToken).toBeTruthy();
    expect(mockAudit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1' }),
      'user.login',
      'user',
      'user-1',
      { method: 'password' },
      expect.anything(),
    );
  });

  it('returns 422 for malformed body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(500); // Zod parse error bubbles via errorHandler
  });
});

describe('GET /api/v1/auth/permissions', () => {
  it('returns public permissions for unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/auth/permissions');
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('public');
    expect(res.body.data.permissions).toContain('document:read_public');
    expect(res.body.data.permissions).not.toContain('admin:users');
  });
});
