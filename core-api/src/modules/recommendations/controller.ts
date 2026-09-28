import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from '../../config';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { ApiError } from '../../types';

export async function getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      entity_type: z.enum(['document', 'dataset', 'region']),
      entity_id: z.string().uuid(),
      limit: z.coerce.number().optional().default(5)
    });
    
    const { entity_type, entity_id, limit } = schema.parse(req.query);
    
    const role = req.user?.role ?? 'public';
    const allowed_visibility = getAllowedVisibilities(role);
    const allowed_status = getAllowedStatuses(role);
    
    const aiServiceUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    const payload = {
      entity_type,
      entity_id,
      limit,
      caller_context: {
        role,
        allowed_visibility,
        allowed_status
      }
    };
    
    const aiRes = await fetch(`${aiServiceUrl}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.AI_SERVICE_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!aiRes.ok) {
      throw new ApiError(aiRes.status, 'AI_SERVICE_ERROR', await aiRes.text());
    }
    
    const data = await aiRes.json();
    res.json({ data: data.data, meta: null, error: null });
  } catch (err) { next(err); }
}
