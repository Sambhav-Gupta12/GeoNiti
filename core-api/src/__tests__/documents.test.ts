import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

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
    RATE_LIMIT_MAX: '100',
  },
}));

vi.mock('../db', () => ({
  pool: { query: vi.fn(), end: vi.fn() },
}));

vi.mock('../services/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import app from '../index';
import { pool } from '../db';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };

const guestToken = '';
const dataAdminToken = jwt.sign({ sub: 'user-2', email: 'admin@test', role: 'data_admin', orgId: null, type: 'access' }, config.JWT_SECRET);
const researcherToken = jwt.sign({ sub: 'user-3', email: 'res@test', role: 'researcher', orgId: null, type: 'access' }, config.JWT_SECRET);

describe('Documents API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/v1/documents - guest sees only public+approved', async () => {
    mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 }); // Mock data and count and facets
    
    // We expect 3 queries to be called: data, count, facets
    mockPool.query.mockResolvedValueOnce({ rows: [] }); // data
    mockPool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // count
    mockPool.query.mockResolvedValueOnce({ rows: [{ type_counts: {}, status_counts: {}, topic_counts: {} }] }); // facets

    const res = await request(app).get('/api/v1/documents');
    
    expect(res.status).toBe(200);
    // Verify that the query arguments for visibility and status were correctly passed
    // The first argument is the dataQuery text, the second is the array of args
    const dataCall = mockPool.query.mock.calls[0];
    expect(dataCall[1]).toContainEqual(['public']); // allowedVisibilities
    expect(dataCall[1]).toContainEqual(['approved']); // allowedStatuses
  });

  it('GET /api/v1/documents - data_admin sees public/internal/restricted and all statuses', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] }); 
    mockPool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); 
    mockPool.query.mockResolvedValueOnce({ rows: [{ type_counts: {}, status_counts: {}, topic_counts: {} }] }); 

    const res = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${dataAdminToken}`);
    
    expect(res.status).toBe(200);
    const dataCall = mockPool.query.mock.calls[0];
    expect(dataCall[1]).toContainEqual(['public', 'internal', 'restricted']);
    expect(dataCall[1]).toContainEqual(['draft', 'pending_review', 'approved', 'rejected']);
  });

  it('POST /api/v1/documents/:id/approve - requires data_admin or system_admin', async () => {
    // researcher tries to approve
    const res1 = await request(app)
      .post('/api/v1/documents/doc-1/approve')
      .set('Authorization', `Bearer ${researcherToken}`)
      .send({ note: 'Looks good' });
    
    expect(res1.status).toBe(403); // researcher doesn't have document:approve

    // data_admin tries to approve
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'doc-1', status: 'pending_review' }] }); // get
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'doc-1', status: 'approved' }] }); // update

    const res2 = await request(app)
      .post('/api/v1/documents/doc-1/approve')
      .set('Authorization', `Bearer ${dataAdminToken}`)
      .send({ note: 'Approved!' });
    
    expect(res2.status).toBe(200);
    expect(res2.body.data.status).toBe('approved');
  });
});
