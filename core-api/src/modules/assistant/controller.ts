import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db';
import { config } from '../../config';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { writeAuditEvent } from '../../services/audit';
import { ApiError } from '../../types';

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    
    const schema = z.object({
      title: z.string().optional().default('New Chat'),
      project_id: z.string().uuid().optional(),
    });
    const data = schema.parse(req.body);

    const result = await pool.query(`
      INSERT INTO chat_sessions (user_id, project_id, title)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [req.user.id, data.project_id || null, data.title]);

    res.json({ data: result.rows[0], meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    
    const result = await pool.query(`
      SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC
    `, [req.user.id]);

    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    const sessionId = req.params.id;
    
    const sessionRes = await pool.query(`
      SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2
    `, [sessionId, req.user.id]);
    
    if (sessionRes.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Session not found');
    }

    const messagesRes = await pool.query(`
      SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC
    `, [sessionId]);

    res.json({ data: { ...sessionRes.rows[0], messages: messagesRes.rows }, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function postMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Must be logged in');
    const sessionId = req.params.id;
    
    const sessionRes = await pool.query(`
      SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2
    `, [sessionId, req.user.id]);
    
    if (sessionRes.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Session not found');
    }

    const schema = z.object({
      content: z.string().min(1),
      scope: z.record(z.any()).optional().default({}),
    });
    const { content, scope } = schema.parse(req.body);

    // 1. Insert user message
    await pool.query(`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES ($1, 'user', $2)
    `, [sessionId, content]);

    // 2. Fetch context
    const messagesRes = await pool.query(`
      SELECT role, content FROM chat_messages 
      WHERE session_id = $1 AND role IN ('user', 'assistant')
      ORDER BY created_at ASC
      LIMIT 10
    `, [sessionId]);
    
    // The context should exclude the last inserted message for the prompt's session history
    const contextMessages = messagesRes.rows.slice(0, -1);

    // 3. Call AI Service
    const role = req.user.role;
    const allowed_visibility = getAllowedVisibilities(role);
    const allowed_status = getAllowedStatuses(role);

    const payload = {
      question: content,
      session_context: contextMessages,
      scope,
      caller_context: {
        role,
        allowed_visibility,
        allowed_status
      }
    };

    const aiServiceUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    const aiRes = await fetch(`${aiServiceUrl}/assistant/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.AI_SERVICE_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      throw new ApiError(aiRes.status, 'AI_SERVICE_ERROR', text);
    }

    const data = await aiRes.json();
    // data contains: answer, grounded, citations, confidence, retrieved_count, model_info

    // 4. Insert Assistant Message
    const asstRes = await pool.query(`
      INSERT INTO chat_messages (session_id, role, content, citations, grounded)
      VALUES ($1, 'assistant', $2, $3, $4)
      RETURNING *
    `, [sessionId, data.answer, JSON.stringify(data.citations), data.grounded]);

    // 5. Update session updated_at
    await pool.query(`UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`, [sessionId]);

    void writeAuditEvent(req.user, 'chat_message', 'chat_sessions', sessionId, { question: content, grounded: data.grounded }, req.ip);

    res.json({ data: asstRes.rows[0], meta: { retrieved_count: data.retrieved_count, confidence: data.confidence, model_info: data.model_info }, error: null });
  } catch (err) { next(err); }
}
