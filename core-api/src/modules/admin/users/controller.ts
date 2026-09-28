import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { listUsers, getUserById, patchUser } from './service';
import { writeAuditEvent } from '../../../services/audit';

const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const patchSchema = z.object({
  is_active: z.boolean().optional(),
  role_id: z.string().uuid().optional(),
});

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, pageSize } = pageSchema.parse(req.query);
    const { rows, total } = await listUsers(page, pageSize);
    res.json({ data: rows, meta: { page, pageSize, total }, error: null });
  } catch (err) { next(err); }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.params.id ?? '');
    res.json({ data: user, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patch = patchSchema.parse(req.body);
    const user = await patchUser(req.params.id ?? '', patch);
    void writeAuditEvent(req.user, 'admin.user.update', 'user', user.id, patch, req.ip);
    res.json({ data: user, meta: null, error: null });
  } catch (err) { next(err); }
}
