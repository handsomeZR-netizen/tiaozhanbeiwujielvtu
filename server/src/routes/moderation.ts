import type { FastifyInstance } from 'fastify';
import { ok } from '../utils/response.js';

export const registerModerationRoutes = async (app: FastifyInstance) => {
  app.post('/moderation', async (request) => {
    return ok({
      input: request.body ?? null,
      status: 'approved',
      reason: 'mock_pass',
    });
  });
};
