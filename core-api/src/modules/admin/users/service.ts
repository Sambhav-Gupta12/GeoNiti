import { pool } from '../../../db';
import { ApiError } from '../../../types';

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
  organization_id: string | null;
  is_active: boolean;
  created_at: Date;
}

export async function listUsers(
  page: number,
  pageSize: number,
): Promise<{ rows: UserRow[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query<UserRow>(
    `SELECT u.id, u.email, u.full_name, r.name AS role_name, u.organization_id, u.is_active, u.created_at
     FROM users u JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset],
  );
  const { rows: cnt } = await pool.query<{ count: string }>(`SELECT COUNT(*) FROM users`);
  return { rows, total: parseInt(cnt[0].count, 10) };
}

export async function getUserById(id: string): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `SELECT u.id, u.email, u.full_name, r.name AS role_name, u.organization_id, u.is_active, u.created_at
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id],
  );
  if (!rows[0]) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  return rows[0];
}

export async function patchUser(
  id: string,
  patch: { is_active?: boolean; role_id?: string },
): Promise<UserRow> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.is_active !== undefined) { sets.push(`is_active=$${i++}`); vals.push(patch.is_active); }
  if (patch.role_id)                  { sets.push(`role_id=$${i++}`);   vals.push(patch.role_id); }
  if (sets.length === 0) throw new ApiError(400, 'BAD_REQUEST', 'No fields to update.');
  sets.push(`updated_at=NOW()`);
  vals.push(id);
  await pool.query(`UPDATE users SET ${sets.join(',')} WHERE id=$${i}`, vals);
  return getUserById(id);
}
