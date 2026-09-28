import { Request, Response, NextFunction } from 'express';
import { listDocumentsSchema, uploadDocumentSchema, patchDocumentSchema, approveDocumentSchema } from './schema';
import { listDocuments, getDocumentById, createDocument, patchDocument, approveDocument, rejectDocument } from './service';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { writeAuditEvent } from '../../services/audit';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../../types';

export async function getDocs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = listDocumentsSchema.parse(req.query);
    const role = req.user?.role ?? 'public';
    const visibilities = getAllowedVisibilities(role);
    const statuses = getAllowedStatuses(role);

    const { rows, total, facets } = await listDocuments(q, visibilities, statuses);
    res.json({ data: rows, meta: { page: q.page, pageSize: q.pageSize, total, facets }, error: null });
  } catch (err) { next(err); }
}

export async function getDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.user?.role ?? 'public';
    const doc = await getDocumentById(req.params.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getDocFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.user?.role ?? 'public';
    const doc = await getDocumentById(req.params.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    if (!doc.file_path) {
      throw new ApiError(404, 'NO_FILE', 'This document does not have an attached file.');
    }
    
    const absolutePath = path.resolve(doc.file_path);
    if (!fs.existsSync(absolutePath)) {
      throw new ApiError(404, 'FILE_NOT_FOUND', 'File not found on disk.');
    }

    void writeAuditEvent(req.user, 'document.download', 'document', doc.id, {}, req.ip);
    res.download(absolutePath);
  } catch (err) { next(err); }
}

export async function createDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = uploadDocumentSchema.parse(req.body);
    const filePath = req.file ? req.file.path : null;
    
    // We create the doc with pending_review
    const doc = await createDocument(data, filePath);
    
    // Wire into extraction
    if (filePath) {
      try {
        const aiServiceUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
        const aiRes = await fetch(`${aiServiceUrl}/extract/metadata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.AI_SERVICE_KEY}` },
          body: JSON.stringify({ file_path: `/app/uploads/documents/${path.basename(filePath)}` })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          await import('../../db').then(({pool}) => 
            pool.query(`UPDATE documents SET extracted_metadata = $1 WHERE id = $2`, [JSON.stringify(aiData.data), doc.id])
          );
        }
      } catch (err) {
        console.error('Failed to extract metadata after upload:', err);
      }
    }

    void writeAuditEvent(req.user, 'document.create', 'document', doc.id, { type: doc.type }, req.ip);
    
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function extractPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filePath = req.file ? req.file.path : null;
    if (!filePath) {
      throw new ApiError(400, 'BAD_REQUEST', 'File is required for extraction preview');
    }

    const aiServiceUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    // AI service and Core API share volumes. The path inside ai-service is /app/uploads/...
    const containerFilePath = `/app/uploads/documents/${path.basename(filePath)}`;
    
    const aiRes = await fetch(`${aiServiceUrl}/extract/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.AI_SERVICE_KEY}`
      },
      body: JSON.stringify({ file_path: containerFilePath })
    });

    if (!aiRes.ok) {
      throw new ApiError(aiRes.status, 'AI_SERVICE_ERROR', await aiRes.text());
    }

    const aiData = await aiRes.json();

    res.json({ data: aiData.data, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function updateDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = patchDocumentSchema.parse(req.body);
    const role = req.user?.role ?? 'public';
    const doc = await patchDocument(req.params.id, data, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    void writeAuditEvent(req.user, 'document.update', 'document', doc.id, data, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function approveDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = approveDocumentSchema.parse(req.body);
    const role = req.user?.role ?? 'public';
    const doc = await approveDocument(req.params.id, data.note, req.user!.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    void writeAuditEvent(req.user, 'document.approve', 'document', doc.id, { note: data.note }, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function rejectDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = approveDocumentSchema.parse(req.body);
    const role = req.user?.role ?? 'public';
    const doc = await rejectDocument(req.params.id, data.note, req.user!.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    void writeAuditEvent(req.user, 'document.reject', 'document', doc.id, { note: data.note }, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}
