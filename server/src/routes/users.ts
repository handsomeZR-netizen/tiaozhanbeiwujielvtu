import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';

const defaultProfile = {
  name: 'Traveler',
  originCountry: '法国',
  destinationCity: '北京',
  interests: [],
  impressionTags: [],
};

export const registerUserRoutes = async (app: FastifyInstance) => {
  app.get('/users/me', async () => {
    return ok(store.getUserProfile() ?? defaultProfile);
  });

  app.post('/users/profile', async (request, reply) => {
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

    return ok(store.setUserProfile(profile));
  });
};
