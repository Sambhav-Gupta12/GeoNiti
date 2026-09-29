import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { getApprovalQueue, bulkApprove, bulkReject, getAuditLog, exportAuditLog, getSystemHealth, reindexSystem, getIntegrations } from './controller';

const router = Router();

// We reuse admin base path, but this is specifically for these new admin endpoints.
// We'll mount it at /api/v1/admin

router.get('/queue', authenticate, requirePermission('document:approve'), getApprovalQueue);
router.post('/queue/bulk-approve', authenticate, requirePermission('document:approve'), bulkApprove);
router.post('/queue/bulk-reject', authenticate, requirePermission('document:approve'), bulkReject);

router.get('/audit', authenticate, requirePermission('admin:audit'), getAuditLog);
router.get('/audit/export', authenticate, requirePermission('admin:audit'), exportAuditLog);

router.get('/system-health', authenticate, requirePermission('admin:users'), getSystemHealth);
router.post('/reindex', authenticate, requirePermission('admin:users'), reindexSystem);
router.get('/integrations', authenticate, getIntegrations);

export default router;
