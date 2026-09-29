import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db';

export async function getGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { center_type, center_id, depth = '1' } = req.query;
    if (!center_type || !center_id) {
      res.status(400).json({ error: 'center_type and center_id required' });
      return;
    }
    
    // We will do a simple BFS or 1-2 hop query using evidence_links, document_regions, etc.
    // For depth 1: just query immediate links
    const maxNodes = 50;
    
    const nodesMap = new Map();
    const edgesList: any[] = [];
    
    // Fetch evidence_links
    const linksRes = await pool.query(`
      SELECT source_type, source_id, target_type, target_id, relation
      FROM evidence_links
      WHERE (source_id = $1 AND source_type = $2)
         OR (target_id = $1 AND target_type = $2)
      LIMIT $3
    `, [center_id, center_type, maxNodes]);
    
    for (const link of linksRes.rows) {
      edgesList.push({ source: link.source_id, target: link.target_id, relation: link.relation });
      nodesMap.set(link.source_id, { id: link.source_id, type: link.source_type, label: \`\${link.source_type}_\${link.source_id.substring(0,6)}\` });
      nodesMap.set(link.target_id, { id: link.target_id, type: link.target_type, label: \`\${link.target_type}_\${link.target_id.substring(0,6)}\` });
    }
    
    // If document, check regions
    if (center_type === 'document') {
      const docRegs = await pool.query(`
        SELECT region_id, r.name 
        FROM document_regions dr
        JOIN regions r ON dr.region_id = r.id
        WHERE dr.document_id = $1
      `, [center_id]);
      
      for (const dr of docRegs.rows) {
        edgesList.push({ source: center_id, target: dr.region_id, relation: 'covers_region' });
        nodesMap.set(center_id, { id: center_id, type: 'document', label: \`document_\${(center_id as string).substring(0,6)}\` });
        nodesMap.set(dr.region_id, { id: dr.region_id, type: 'region', label: dr.name });
      }
    }
    
    // Resolve labels for known types (documents, datasets)
    const nodeIds = Array.from(nodesMap.keys());
    if (nodeIds.length > 0) {
      const docRes = await pool.query(`SELECT id, title FROM documents WHERE id = ANY($1)`, [nodeIds]);
      for (const d of docRes.rows) {
        const n = nodesMap.get(d.id);
        if (n) { n.label = d.title; nodesMap.set(d.id, n); }
      }
      const dataRes = await pool.query(`SELECT id, title FROM datasets WHERE id = ANY($1)`, [nodeIds]);
      for (const d of dataRes.rows) {
        const n = nodesMap.get(d.id);
        if (n) { n.label = d.title; nodesMap.set(d.id, n); }
      }
      const regRes = await pool.query(`SELECT id, name FROM regions WHERE id = ANY($1)`, [nodeIds]);
      for (const d of regRes.rows) {
        const n = nodesMap.get(d.id);
        if (n) { n.label = d.name; nodesMap.set(d.id, n); }
      }
    }
    
    // Ensure center is in nodes even if isolated
    if (!nodesMap.has(center_id)) {
      nodesMap.set(center_id, { id: center_id, type: center_type, label: \`\${center_type} (Center)\` });
    }
    
    res.json({
      data: {
        nodes: Array.from(nodesMap.values()),
        edges: edgesList
      },
      meta: null, error: null
    });
  } catch (err) { next(err); }
}

const linkSchema = z.object({
  source_type: z.string(),
  source_id: z.string().uuid(),
  target_type: z.string(),
  target_id: z.string().uuid(),
  relation: z.string()
});

export async function createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = linkSchema.parse(req.body);
    const dbRes = await pool.query(`
      INSERT INTO evidence_links (source_type, source_id, target_type, target_id, relation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [payload.source_type, payload.source_id, payload.target_type, payload.target_id, payload.relation]);
    
    res.status(201).json({ data: dbRes.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function deleteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM evidence_links WHERE id = $1`, [id]);
    res.json({ data: { success: true }, meta: null, error: null });
  } catch (err) { next(err); }
}
