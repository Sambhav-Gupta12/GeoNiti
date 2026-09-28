import { Request, Response, NextFunction } from 'express';
import { listDatasetsSchema, createDatasetSchema, createDatasetVersionSchema, patchDatasetSchema, approveDatasetSchema } from './schema';
import { listDatasets, getDatasetById, getDatasetVersions, createDataset, createDatasetVersion, patchDataset, approveDataset, rejectDataset } from './service';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { writeAuditEvent } from '../../services/audit';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../../types';

export async function getDatasets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = listDatasetsSchema.parse(req.query);
    const role = req.user?.role ?? 'public';
    const visibilities = getAllowedVisibilities(role);
    const statuses = getAllowedStatuses(role);

    const { rows, total } = await listDatasets(q, visibilities, statuses);
    res.json({ data: rows, meta: { page: q.page, pageSize: q.pageSize, total }, error: null });
  } catch (err) { next(err); }
}

export async function getDataset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.user?.role ?? 'public';
    const doc = await getDatasetById(req.params.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.user?.role ?? 'public';
    const versions = await getDatasetVersions(req.params.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    res.json({ data: versions, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getDatasetDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.user?.role ?? 'public';
    const versions = await getDatasetVersions(req.params.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    if (versions.length === 0 || !versions[0].file_path) {
      throw new ApiError(404, 'NO_FILE', 'This dataset does not have an attached file.');
    }
    
    const absolutePath = path.resolve(versions[0].file_path);
    if (!fs.existsSync(absolutePath)) {
      throw new ApiError(404, 'FILE_NOT_FOUND', 'File not found on disk.');
    }

    void writeAuditEvent(req.user, 'dataset.download', 'dataset', req.params.id, { version: versions[0].id }, req.ip);
    res.download(absolutePath);
  } catch (err) { next(err); }
}

export async function createDs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createDatasetSchema.parse(req.body);
    const doc = await createDataset(data);
    void writeAuditEvent(req.user, 'dataset.create', 'dataset', doc.id, { title: doc.title }, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function createDsVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createDatasetVersionSchema.parse(req.body);
    const filePath = req.file ? req.file.path : null;
    const version = await createDatasetVersion(req.params.id, data, filePath);
    void writeAuditEvent(req.user, 'dataset.version.create', 'dataset', req.params.id, { versionId: version.id }, req.ip);
    res.json({ data: version, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function updateDs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = patchDatasetSchema.parse(req.body);
    const role = req.user?.role ?? 'public';
    const doc = await patchDataset(req.params.id, data, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    void writeAuditEvent(req.user, 'dataset.update', 'dataset', doc.id, data, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function approveDs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = approveDatasetSchema.parse(req.body);
    const role = req.user?.role ?? 'public';
    const doc = await approveDataset(req.params.id, data.note, req.user!.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    void writeAuditEvent(req.user, 'dataset.approve', 'dataset', doc.id, { note: data.note }, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function rejectDs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = approveDatasetSchema.parse(req.body);
    const role = req.user?.role ?? 'public';
    const doc = await rejectDataset(req.params.id, data.note, req.user!.id, getAllowedVisibilities(role), getAllowedStatuses(role));
    
    void writeAuditEvent(req.user, 'dataset.reject', 'dataset', doc.id, { note: data.note }, req.ip);
    res.json({ data: doc, meta: null, error: null });
  } catch (err) { next(err); }
}
