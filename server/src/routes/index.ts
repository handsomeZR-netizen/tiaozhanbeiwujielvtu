import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './health.js';
import { registerShareRoutes } from './share.js';
import { registerUserRoutes } from './users.js';
import { registerDiaryRoutes } from './diaries.js';
import { registerCommunityRoutes } from './community.js';
import { registerMapRoutes } from './map.js';
import { registerAiRoutes } from './ai.js';
import { registerModerationRoutes } from './moderation.js';
import { registerAtlasRoutes } from './atlas.js';
import { registerPosterRoutes } from './posters.js';

export const registerRoutes = async (app: FastifyInstance) => {
  await registerHealthRoutes(app);
  await registerShareRoutes(app);
  await registerUserRoutes(app);
  await registerDiaryRoutes(app);
  await registerCommunityRoutes(app);
  await registerMapRoutes(app);
  await registerAiRoutes(app);
  await registerModerationRoutes(app);
  await registerAtlasRoutes(app);
  await registerPosterRoutes(app);
};
