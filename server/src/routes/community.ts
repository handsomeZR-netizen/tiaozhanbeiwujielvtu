import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { communityFeed } from '../mocks/index.js';
import { getPool } from '../db.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';
import { getAuthUser } from '../utils/auth.js';

export const registerCommunityRoutes = async (app: FastifyInstance) => {
  app.get('/community/feed', async () => {
    const posts = [...store.listCommunityPosts()];

    if (process.env.MOCK_MODE !== 'true') {
      const db = getPool();
      const result = await db.query(
        `SELECT id, user_name, title, img, tags, location, created_at
         FROM community_posts
         ORDER BY created_at DESC
         LIMIT 20`,
      );
      posts.push(
        ...result.rows.map((row) => ({
          id: row.id,
          user: row.user_name,
          title: row.title,
          img: row.img,
          tags: row.tags ?? [],
          location: row.location ?? undefined,
          createdAt: row.created_at.toISOString(),
        })),
      );
    }

    const merged = [...posts, ...communityFeed].slice(0, 20);
    return ok(merged);
  });

  app.post('/community/posts', async (request, reply) => {
    const body = request.body as {
      user?: string;
      title?: string;
      img?: string;
      tags?: string[];
      location?: string;
    };

    if (!body?.title) {
      reply.status(400);
      return fail('Post title is required.');
    }

    const authUser = await getAuthUser(request);
    const userName = body.user || authUser?.username || 'Traveler';
    const post = {
      id: `post_${Date.now()}`,
      user: userName,
      title: body.title,
      img: body.img ?? 'https://picsum.photos/seed/newpost/400/300',
      tags: Array.isArray(body.tags) ? body.tags : [],
      location: body.location ?? '北京',
      createdAt: new Date().toISOString(),
    };

    if (process.env.MOCK_MODE === 'true') {
      return ok(store.addCommunityPost(post));
    }

    const db = getPool();
    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO community_posts (id, user_id, user_name, title, img, tags, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_name, title, img, tags, location, created_at`,
      [
        id,
        authUser?.id ?? null,
        userName,
        body.title,
        body.img ?? null,
        Array.isArray(body.tags) ? body.tags : [],
        body.location ?? null,
      ],
    );
    const row = result.rows[0];
    return ok({
      id: row.id,
      user: row.user_name,
      title: row.title,
      img: row.img,
      tags: row.tags ?? [],
      location: row.location ?? undefined,
      createdAt: row.created_at.toISOString(),
    });
  });
};
