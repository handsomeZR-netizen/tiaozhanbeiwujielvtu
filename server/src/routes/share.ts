import type { FastifyInstance } from 'fastify';
import { isMockMode } from '../utils/env.js';
import { shareCardSample } from '../mocks/index.js';

export const registerShareRoutes = async (app: FastifyInstance) => {
  app.post('/share', async () => {
    if (isMockMode()) {
      return { ok: true, data: shareCardSample };
    }

    return {
      ok: true,
      data: shareCardSample,
      note: 'Share is mocked for demo. Switch MOCK_MODE to false when real service is ready.',
    };
  });
};
