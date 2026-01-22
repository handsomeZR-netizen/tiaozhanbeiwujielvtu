import { Pool } from 'pg';

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

let pool: Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host: getEnv('PGHOST', 'localhost'),
      port: parsePort(getEnv('PGPORT', '5432')),
      user: getEnv('PGUSER', 'postgres'),
      password: getEnv('PGPASSWORD'),
      database: getEnv('PGDATABASE', 'boundless_lens'),
    });
  }
  return pool;
};

export const initDb = async () => {
  const db = getPool();
  await db.query(`
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

  await db.query(`
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
};

export const closeDb = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
