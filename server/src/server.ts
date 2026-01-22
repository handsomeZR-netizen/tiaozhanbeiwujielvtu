import { config } from 'dotenv';
import { buildApp } from './app.js';

config({ path: '.env.server' });

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';

const start = async () => {
  const app = await buildApp();
  try {
    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
