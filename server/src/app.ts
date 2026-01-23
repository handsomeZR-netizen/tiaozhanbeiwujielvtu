import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { registerRoutes } from './routes/index.js';
import { initDb } from './db.js';
import { ensureUploadsDir, getUploadsDir } from './utils/uploads.js';

type AppOptions = {
  logger?: boolean;
};

export const buildApp = async (options: AppOptions = {}) => {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  const mockMode = (process.env.MOCK_MODE ?? 'false') === 'true';
  if (!mockMode) {
    await initDb();
  }

  await app.register(cors, {
    origin: true,
  });

  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  await ensureUploadsDir();
  await app.register(fastifyStatic, {
    root: getUploadsDir(),
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(500).send({
      ok: false,
      error: 'Internal Server Error',
    });
  });

  await registerRoutes(app);

  return app;
};
