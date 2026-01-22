import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: '.env.server' });

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

const parsePort = (value: string) => {
  const port = Number(value);
  if (Number.isNaN(port)) {
    throw new Error(`Invalid PGPORT: ${value}`);
  }
  return port;
};

const makeClient = (database: string) =>
  new Client({
    host: getEnv('PGHOST', 'localhost'),
    port: parsePort(getEnv('PGPORT', '5432')),
    user: getEnv('PGUSER', 'postgres'),
    password: getEnv('PGPASSWORD'),
    database,
  });

const ensureDatabase = async (dbName: string) => {
  const admin = makeClient('postgres');
  await admin.connect();
  try {
    const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (existing.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database exists: ${dbName}`);
    }
  } finally {
    await admin.end();
  }
};

const ensureSchema = async (dbName: string) => {
  const client = makeClient(dbName);
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS diaries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        media_urls TEXT[] NOT NULL DEFAULT '{}',
        location TEXT,
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Schema ready: diaries');

    await client.query(`
      CREATE TABLE IF NOT EXISTS posters (
        id TEXT PRIMARY KEY,
        city TEXT,
        theme TEXT,
        style TEXT,
        language TEXT,
        platform TEXT,
        size TEXT,
        prompt TEXT NOT NULL,
        image_url TEXT NOT NULL,
        copy_title TEXT,
        copy_subtitle TEXT,
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Schema ready: posters');
  } finally {
    await client.end();
  }
};

const run = async () => {
  const dbName = getEnv('PGDATABASE', 'boundless_lens');
  await ensureDatabase(dbName);
  await ensureSchema(dbName);
};

run().catch((error) => {
  console.error('init-db failed');
  console.error(error);
  process.exit(1);
});
