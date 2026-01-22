import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';

const toEntry = (poi: any) => ({
  id: String(poi.id),
  name: String(poi.name ?? '未命名地点'),
  lng: Number(poi.lng ?? 0),
  lat: Number(poi.lat ?? 0),
  address: poi.address,
  tags: Array.isArray(poi.tags) ? poi.tags : [],
  createdAt: new Date().toISOString(),
  note: poi.note,
});

export const registerAtlasRoutes = async (app: FastifyInstance) => {
  app.get('/atlas/favorites', async () => ok(store.listFavorites()));

  app.post('/atlas/favorites', async (request, reply) => {
    const body = request.body as { poi?: any; remove?: boolean };
    if (!body?.poi?.id) {
      reply.status(400);
      return fail('poi is required.');
    }

    if (body.remove) {
      return ok(store.removeFavorite(String(body.poi.id)));
    }

    const entry = toEntry(body.poi);
    return ok(store.addFavorite(entry));
  });

  app.get('/atlas/checkins', async () => ok(store.listCheckins()));

  app.post('/atlas/checkins', async (request, reply) => {
    const body = request.body as { poi?: any };
    if (!body?.poi?.id) {
      reply.status(400);
      return fail('poi is required.');
    }
    const entry = toEntry(body.poi);
    return ok(store.addCheckin(entry));
  });
};
