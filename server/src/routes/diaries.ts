import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { getPool } from '../db.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';

type DiaryInput = {
  title?: string;
  content?: string;
  mediaUrls?: string[];
  location?: string;
  tags?: string[];
};

type DiaryRecord = {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  location?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const isMockMode = () => (process.env.MOCK_MODE ?? 'false') === 'true';

const mapRow = (row: {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  location: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}): DiaryRecord => ({
  id: row.id,
  title: row.title,
  content: row.content,
  mediaUrls: row.media_urls ?? [],
  location: row.location,
  tags: row.tags ?? [],
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export const registerDiaryRoutes = async (app: FastifyInstance) => {
  app.get('/diaries', async () => {
    if (isMockMode()) {
      return ok(store.listDiaries());
    }
    const db = getPool();
    const result = await db.query(
      'SELECT id, title, content, media_urls, location, tags, created_at, updated_at FROM diaries ORDER BY created_at DESC',
    );
    return ok(result.rows.map(mapRow));
  });

  app.get('/diaries/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (isMockMode()) {
      const entry = store.listDiaries().find((item) => item.id === id);
      if (!entry) {
        reply.status(404);
        return fail('Diary not found.');
      }
      return ok(entry);
    }
    const db = getPool();
    const result = await db.query(
      'SELECT id, title, content, media_urls, location, tags, created_at, updated_at FROM diaries WHERE id = $1',
      [id],
    );
    if (result.rowCount === 0) {
      reply.status(404);
      return fail('Diary not found.');
    }
    return ok(mapRow(result.rows[0]));
  });

  app.post('/diaries', async (request, reply) => {
    const body = request.body as DiaryInput;

    if (!body?.title || !body?.content) {
      reply.status(400);
      return fail('Diary title and content are required.');
    }

    if (isMockMode()) {
      const entry = {
        id: `diary_${Date.now()}`,
        title: body.title,
        content: body.content,
        mediaUrls: Array.isArray(body.mediaUrls) ? body.mediaUrls : [],
        location: body.location,
        tags: Array.isArray(body.tags) ? body.tags : [],
        createdAt: new Date().toISOString(),
      };
      return ok(store.addDiary(entry));
    }

    const db = getPool();
    const id = randomUUID();
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls : [];
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const result = await db.query(
      `INSERT INTO diaries (id, title, content, media_urls, location, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, content, media_urls, location, tags, created_at, updated_at`,
      [id, body.title, body.content, mediaUrls, body.location ?? null, tags],
    );
    return ok(mapRow(result.rows[0]));
  });

  app.patch('/diaries/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as DiaryInput;

    if (isMockMode()) {
      reply.status(400);
      return fail('Mock mode does not support updating diaries.');
    }

    const db = getPool();
    const existing = await db.query('SELECT id FROM diaries WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      reply.status(404);
      return fail('Diary not found.');
    }

    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls : undefined;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

    const result = await db.query(
      `UPDATE diaries
       SET title = COALESCE($2, title),
           content = COALESCE($3, content),
           media_urls = COALESCE($4, media_urls),
           location = COALESCE($5, location),
           tags = COALESCE($6, tags),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, content, media_urls, location, tags, created_at, updated_at`,
      [id, body.title ?? null, body.content ?? null, mediaUrls ?? null, body.location ?? null, tags ?? null],
    );

    return ok(mapRow(result.rows[0]));
  });

  app.delete('/diaries/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (isMockMode()) {
      reply.status(400);
      return fail('Mock mode does not support deleting diaries.');
    }

    const db = getPool();
    const result = await db.query('DELETE FROM diaries WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      reply.status(404);
      return fail('Diary not found.');
    }
    return ok({ id });
  });
};
