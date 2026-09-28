import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { getDatasets, getDataset, getVersions, getDatasetDownload, createDs, createDsVersion, updateDs, approveDs, rejectDs } from './controller';

const uploadDir = path.resolve(__dirname, '../../../../uploads/datasets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB
const router = Router();

router.use(authenticate);

// Public/Authed read routes
router.get('/', getDatasets);
router.get('/:id', getDataset);
router.get('/:id/versions', getVersions);
router.get('/:id/download', getDatasetDownload);

// Create / Update
router.post('/', requirePermission('dataset:create'), createDs);
router.post('/:id/versions', requirePermission('dataset:create'), upload.single('file'), createDsVersion);
router.patch('/:id', requirePermission('dataset:create'), updateDs);

// Admin approvals
router.post('/:id/approve', requirePermission('dataset:approve'), approveDs);
router.post('/:id/reject', requirePermission('dataset:approve'), rejectDs);

export default router;
