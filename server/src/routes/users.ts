import type { FastifyInstance } from 'fastify';
import { getPool } from '../db.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';
import { requireAuthUser } from '../utils/auth.js';

const defaultProfile = {
  name: 'Traveler',
  originCountry: '法国',
  destinationCity: '北京',
  interests: [],
  impressionTags: [],
};

const mapRow = (row: {
  name: string | null;
  origin_country: string | null;
  destination_city: string | null;
  interests: string[] | null;
  impression_tags: string[] | null;
}) => ({
  name: row.name ?? defaultProfile.name,
  originCountry: row.origin_country ?? defaultProfile.originCountry,
  destinationCity: row.destination_city ?? defaultProfile.destinationCity,
  interests: row.interests ?? [],
  impressionTags: row.impression_tags ?? [],
});

export const registerUserRoutes = async (app: FastifyInstance) => {
  app.get('/users/me', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;

    if ((process.env.MOCK_MODE ?? 'false') === 'true') {
      return ok(store.getUserProfile() ?? { ...defaultProfile, name: user.username });
    }

    const db = getPool();
    const result = await db.query(
      `SELECT name, origin_country, destination_city, interests, impression_tags
       FROM user_profiles
       WHERE user_id = $1`,
      [user.id],
    );
    if (result.rowCount === 0) {
      return ok({ ...defaultProfile, name: user.username });
    }
    return ok(mapRow(result.rows[0]));
  });

  app.post('/users/profile', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const body = request.body as Partial<typeof defaultProfile> | undefined;
    if (!body?.name || !body.originCountry || !body.destinationCity) {
      reply.status(400);
      return fail('Missing required profile fields.');
    }

    const profile = {
      name: body.name,
      originCountry: body.originCountry,
      destinationCity: body.destinationCity,
      interests: Array.isArray(body.interests) ? body.interests : [],
      impressionTags: Array.isArray(body.impressionTags) ? body.impressionTags : [],
    };

    if ((process.env.MOCK_MODE ?? 'false') === 'true') {
      return ok(store.setUserProfile(profile));
    }

    const db = getPool();
    const result = await db.query(
      `INSERT INTO user_profiles (user_id, name, origin_country, destination_city, interests, impression_tags, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         name = EXCLUDED.name,
         origin_country = EXCLUDED.origin_country,
         destination_city = EXCLUDED.destination_city,
         interests = EXCLUDED.interests,
         impression_tags = EXCLUDED.impression_tags,
         updated_at = NOW()
       RETURNING name, origin_country, destination_city, interests, impression_tags`,
      [
        user.id,
        profile.name,
        profile.originCountry,
        profile.destinationCity,
        profile.interests,
        profile.impressionTags,
      ],
    );

    return ok(mapRow(result.rows[0]));
  });
};
