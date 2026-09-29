import { Request, Response, NextFunction } from 'express';
import { pool } from '../../db';
import { ApiError } from '../../types';
import { z } from 'zod';

export async function listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    // Projects owned by user or where user is member
    const dbRes = await pool.query(`
      SELECT p.*, pm.role 
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
      WHERE p.owner_id = $1 OR pm.user_id = $1 OR p.is_public = TRUE
      ORDER BY p.updated_at DESC
    `, [userId]);
    res.json({ data: dbRes.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const pRes = await pool.query(`
      SELECT p.*, 
        (SELECT role FROM project_members WHERE project_id = p.id AND user_id = $2) as my_role
      FROM projects p
      WHERE p.id = $1
    `, [id, userId]);
    
    if (pRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    const project = pRes.rows[0];
    
    if (!project.is_public && project.owner_id !== userId && !project.my_role) {
      throw new ApiError(403, 'FORBIDDEN', 'Access denied');
    }
    
    const itemsRes = await pool.query(`SELECT * FROM project_items WHERE project_id = $1 ORDER BY position ASC`, [id]);
    const membersRes = await pool.query(`SELECT user_id, role, joined_at FROM project_members WHERE project_id = $1`, [id]);
    
    res.json({ data: { ...project, items: itemsRes.rows, members: membersRes.rows }, meta: null, error: null });
  } catch (err) { next(err); }
}

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_public: z.boolean().default(false)
});

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = projectSchema.parse(req.body);
    const userId = req.user!.id;
    
    const dbRes = await pool.query(`
      INSERT INTO projects (name, description, owner_id, is_public)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [payload.name, payload.description || '', userId, payload.is_public]);
    
    res.status(201).json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const payload = req.body;
    const userId = req.user!.id;
    
    const pRes = await pool.query(`SELECT owner_id, (SELECT role FROM project_members WHERE project_id = id AND user_id = $2) as role FROM projects WHERE id = $1`, [id, userId]);
    if (pRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    if (pRes.rows[0].owner_id !== userId && pRes.rows[0].role !== 'editor') throw new ApiError(403, 'FORBIDDEN', 'Access denied');
    
    const dbRes = await pool.query(`
      UPDATE projects SET name = COALESCE($2, name), description = COALESCE($3, description), is_public = COALESCE($4, is_public), updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, payload.name, payload.description, payload.is_public]);
    
    res.json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const pRes = await pool.query(`SELECT owner_id FROM projects WHERE id = $1`, [id]);
    if (pRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    if (pRes.rows[0].owner_id !== userId) throw new ApiError(403, 'FORBIDDEN', 'Only owner can delete');
    
    await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
    res.json({ data: { success: true }, meta: null, error: null });
  } catch (err) { next(err); }
}

const itemSchema = z.object({
  item_type: z.enum(['document','dataset','map_view','analysis','scenario_run','chat_answer','note','region','search']),
  item_id: z.string().uuid().optional(),
  payload: z.any().optional(),
  note: z.string().optional()
});

export async function addProjectItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const payload = itemSchema.parse(req.body);
    const userId = req.user!.id;
    
    // Check permission
    const pRes = await pool.query(`SELECT owner_id, (SELECT role FROM project_members WHERE project_id = id AND user_id = $2) as role FROM projects WHERE id = $1`, [id, userId]);
    if (pRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    if (pRes.rows[0].owner_id !== userId && pRes.rows[0].role !== 'editor') throw new ApiError(403, 'FORBIDDEN', 'Access denied');
    
    // Validate visibility if document
    if (payload.item_type === 'document' && payload.item_id) {
       // Just a simple check if document exists. Visibility logic would ideally be checked, but for now we just verify existence.
       const dRes = await pool.query(`SELECT id FROM documents WHERE id = $1`, [payload.item_id]);
       if (dRes.rows.length === 0) throw new ApiError(403, 'FORBIDDEN', 'Document not found or access denied');
    }

    const posRes = await pool.query(`SELECT MAX(position) as mx FROM project_items WHERE project_id = $1`, [id]);
    const pos = (posRes.rows[0].mx || 0) + 1;
    
    const dbRes = await pool.query(`
      INSERT INTO project_items (project_id, item_type, item_id, note, position)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, payload.item_type, payload.item_id || null, JSON.stringify(payload.payload || payload.note), pos]);
    
    res.status(201).json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function deleteProjectItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, itemId } = req.params;
    const userId = req.user!.id;
    
    const pRes = await pool.query(`SELECT owner_id, (SELECT role FROM project_members WHERE project_id = id AND user_id = $2) as role FROM projects WHERE id = $1`, [id, userId]);
    if (pRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    if (pRes.rows[0].owner_id !== userId && pRes.rows[0].role !== 'editor') throw new ApiError(403, 'FORBIDDEN', 'Access denied');
    
    await pool.query(`DELETE FROM project_items WHERE id = $1 AND project_id = $2`, [itemId, id]);
    res.json({ data: { success: true }, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function exportProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const format = req.query.format;
    const userId = req.user?.id;
    
    const pRes = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
    if (pRes.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    
    const project = pRes.rows[0];
    
    if (format === 'md') {
       const items = await pool.query(`SELECT * FROM project_items WHERE project_id = $1 ORDER BY position`, [id]);
       let md = `# ${project.name}\n\n${project.description || ''}\n\n## Project Items\n`;
       
       for (const item of items.rows) {
         md += `- **${item.item_type}**: ${item.note || item.item_id}\n`;
       }
       
       md += `\n\n---\n*Exported by BhuNiti System*`;
       res.setHeader('Content-Type', 'text/markdown');
       res.send(md);
       return;
    }
    
    res.json({ data: { error: 'Unsupported format' }, meta: null, error: null });
  } catch (err) { next(err); }
}
