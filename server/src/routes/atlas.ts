import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { getPool } from '../db.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';
import { requireAuthUser } from '../utils/auth.js';

const toEntry = (poi: any) => ({
  id: String(poi.id),
  name: String(poi.name ?? '未命名地点'),
  lng: Number(poi.lng ?? 0),
  lat: Number(poi.lat ?? 0),
  address: poi.address,
  tags: Array.isArray(poi.tags) ? poi.tags : [],
  note: poi.note,
});

const mapRow = (row: {
  poi_id: string;
  name: string;
  lng: number;
  lat: number;
  address: string | null;
  tags: string[] | null;
  note: string | null;
  created_at: Date;
}) => ({
  id: row.poi_id,
  name: row.name,
  lng: Number(row.lng),
  lat: Number(row.lat),
  address: row.address ?? undefined,
  tags: row.tags ?? [],
  note: row.note ?? undefined,
  createdAt: row.created_at.toISOString(),
});

export const registerAtlasRoutes = async (app: FastifyInstance) => {
  app.get('/atlas/favorites', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    if ((process.env.MOCK_MODE ?? 'false') === 'true') {
      return ok(store.listFavorites());
    }
    const db = getPool();
    const result = await db.query(
      `SELECT poi_id, name, lng, lat, address, tags, note, created_at
       FROM atlas_favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id],
    );
    return ok(result.rows.map(mapRow));
  });

  app.post('/atlas/favorites', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const body = request.body as { poi?: any; remove?: boolean };
    if (!body?.poi?.id) {
      reply.status(400);
      return fail('poi is required.');
    }

    if ((process.env.MOCK_MODE ?? 'false') === 'true') {
      if (body.remove) {
        return ok(store.removeFavorite(String(body.poi.id)));
      }
      const entry = toEntry(body.poi);
      return ok(store.addFavorite({ ...entry, createdAt: new Date().toISOString() }));
    }

    const db = getPool();
    const poi = toEntry(body.poi);

    if (body.remove) {
      await db.query('DELETE FROM atlas_favorites WHERE user_id = $1 AND poi_id = $2', [user.id, poi.id]);
      return ok({ id: poi.id, removed: true });
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO atlas_favorites (id, user_id, poi_id, name, lng, lat, address, tags, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, poi_id) DO UPDATE SET
         name = EXCLUDED.name,
         lng = EXCLUDED.lng,
         lat = EXCLUDED.lat,
         address = EXCLUDED.address,
         tags = EXCLUDED.tags,
         note = EXCLUDED.note
       RETURNING poi_id, name, lng, lat, address, tags, note, created_at`,
      [
        id,
        user.id,
        poi.id,
        poi.name,
        poi.lng,
        poi.lat,
        poi.address ?? null,
        poi.tags ?? [],
        poi.note ?? null,
      ],
    );
    return ok(mapRow(result.rows[0]));
  });

  app.get('/atlas/checkins', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    if ((process.env.MOCK_MODE ?? 'false') === 'true') {
      return ok(store.listCheckins());
    }
    const db = getPool();
    const result = await db.query(
      `SELECT poi_id, name, lng, lat, address, tags, note, created_at
       FROM atlas_checkins
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id],
    );
    return ok(result.rows.map(mapRow));
  });

  app.post('/atlas/checkins', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const body = request.body as { poi?: any };
    if (!body?.poi?.id) {
      reply.status(400);
      return fail('poi is required.');
    }

    if ((process.env.MOCK_MODE ?? 'false') === 'true') {
      const entry = toEntry(body.poi);
      return ok(store.addCheckin({ ...entry, createdAt: new Date().toISOString() }));
    }

    const db = getPool();
    const poi = toEntry(body.poi);
    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO atlas_checkins (id, user_id, poi_id, name, lng, lat, address, tags, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, poi_id) DO UPDATE SET
         name = EXCLUDED.name,
         lng = EXCLUDED.lng,
         lat = EXCLUDED.lat,
         address = EXCLUDED.address,
         tags = EXCLUDED.tags,
         note = EXCLUDED.note
       RETURNING poi_id, name, lng, lat, address, tags, note, created_at`,
      [
        id,
        user.id,
        poi.id,
        poi.name,
        poi.lng,
        poi.lat,
        poi.address ?? null,
        poi.tags ?? [],
        poi.note ?? null,
      ],
    );
    return ok(mapRow(result.rows[0]));
  });
};
