import type { FastifyInstance } from 'fastify';
import { communityFeed } from '../mocks/index.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';

export const registerCommunityRoutes = async (app: FastifyInstance) => {
  app.get('/community/feed', async () => {
    const posts = [...store.listCommunityPosts(), ...communityFeed].slice(0, 20);
    return ok(posts);
  });

  app.post('/community/posts', async (request, reply) => {
    const body = request.body as {
      user?: string;
      title?: string;
      img?: string;
      tags?: string[];
      location?: string;
    };

    if (!body?.user || !body?.title) {
      reply.status(400);
      return fail('Post user and title are required.');
    }

    const post = {
      id: `post_${Date.now()}`,
      user: body.user,
      title: body.title,
      img: body.img ?? 'https://picsum.photos/seed/newpost/400/300',
      tags: Array.isArray(body.tags) ? body.tags : [],
      location: body.location ?? '北京',
      createdAt: new Date().toISOString(),
    };

    return ok(store.addCommunityPost(post));
  });
};
