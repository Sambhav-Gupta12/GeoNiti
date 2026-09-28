import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { getDocs, getDoc, getDocFile, createDoc, updateDoc, approveDoc, rejectDoc } from './controller';

const uploadDir = path.resolve(__dirname, '../../../../uploads/documents');
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

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
const router = Router();

router.use(authenticate);

// Public/Authed read routes
router.get('/', getDocs);
router.get('/:id', getDoc);
router.get('/:id/file', getDocFile);

// Create / Update
router.post('/', requirePermission('document:create'), upload.single('file'), createDoc);
router.patch('/:id', requirePermission('document:create'), updateDoc);

// Admin approvals
router.post('/:id/approve', requirePermission('document:approve'), approveDoc);
router.post('/:id/reject', requirePermission('document:approve'), rejectDoc);

export default router;
