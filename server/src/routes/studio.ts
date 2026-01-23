import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { getPool } from '../db.js';
import { ok, fail } from '../utils/response.js';
import { requireAuthUser } from '../utils/auth.js';

type StudioHistoryInput = {
  image?: string;
  result?: unknown;
};

export const registerStudioRoutes = async (app: FastifyInstance) => {
  app.get('/studio/history', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const { limit } = request.query as { limit?: string };
    const db = getPool();
    const result = await db.query(
      `SELECT id, image, result, created_at
       FROM studio_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [user.id, Number(limit ?? 20)],
    );
    const rows = result.rows.map((row) => ({
      id: row.id,
      image: row.image,
      result: typeof row.result === 'string' ? JSON.parse(row.result) : row.result,
      timestamp: row.created_at instanceof Date ? row.created_at.getTime() : Date.now(),
    }));
    return ok(rows);
  });

  app.post('/studio/history', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const body = request.body as StudioHistoryInput;
    if (!body?.image || !body?.result) {
      reply.status(400);
      return fail('image and result are required.');
    }

    const db = getPool();
    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO studio_history (id, user_id, image, result)
       VALUES ($1, $2, $3, $4)
       RETURNING id, image, result, created_at`,
      [id, user.id, body.image, JSON.stringify(body.result)],
    );
    const row = result.rows[0];
    return ok({
      id: row.id,
      image: row.image,
      result: typeof row.result === 'string' ? JSON.parse(row.result) : row.result,
      timestamp: row.created_at instanceof Date ? row.created_at.getTime() : Date.now(),
    });
  });
};
