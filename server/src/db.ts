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

const shouldUseSsl = (connectionString?: string) => {
  if (String(process.env.PGSSLMODE || '').toLowerCase() === 'require') {
    return true;
  }
  if (connectionString && /sslmode=require/i.test(connectionString)) {
    return true;
  }
  return false;
};

let pool: Pool | null = null;

export const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    const ssl = shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined;

    pool = connectionString
      ? new Pool({
          connectionString,
          ssl,
        })
      : new Pool({
          host: getEnv('PGHOST', 'localhost'),
          port: parsePort(getEnv('PGPORT', '5432')),
          user: getEnv('PGUSER', 'postgres'),
          password: getEnv('PGPASSWORD'),
          database: getEnv('PGDATABASE', 'boundless_lens'),
          ssl,
          // Ensure UTF-8 encoding for Chinese characters
          client_encoding: 'UTF8',
        });
  }
  return pool;
};

export const initDb = async () => {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS diaries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
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
      user_id TEXT,
      city TEXT,
      theme TEXT,
      style TEXT,
      language TEXT,
      platform TEXT,
      size TEXT,
      prompt_raw TEXT,
      prompt_polished TEXT,
      prompt TEXT NOT NULL,
      image_url TEXT NOT NULL,
      copy_title TEXT,
      copy_subtitle TEXT,
      copy_title_raw TEXT,
      copy_subtitle_raw TEXT,
      copy_title_polished TEXT,
      copy_subtitle_polished TEXT,
      share_zh TEXT,
      share_en TEXT,
      tags TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    ALTER TABLE posters
      ADD COLUMN IF NOT EXISTS user_id TEXT,
      ADD COLUMN IF NOT EXISTS prompt_raw TEXT,
      ADD COLUMN IF NOT EXISTS prompt_polished TEXT,
      ADD COLUMN IF NOT EXISTS copy_title_raw TEXT,
      ADD COLUMN IF NOT EXISTS copy_subtitle_raw TEXT,
      ADD COLUMN IF NOT EXISTS copy_title_polished TEXT,
      ADD COLUMN IF NOT EXISTS copy_subtitle_polished TEXT,
      ADD COLUMN IF NOT EXISTS share_zh TEXT,
      ADD COLUMN IF NOT EXISTS share_en TEXT;
  `);

  await db.query(`
    ALTER TABLE diaries
      ADD COLUMN IF NOT EXISTS user_id TEXT;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      avatar_url TEXT,
      bio TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token);`);
  await db.query(`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS diaries_user_id_idx ON diaries(user_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS posters_user_id_idx ON posters(user_id);`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      title TEXT NOT NULL,
      img TEXT,
      tags TEXT[] NOT NULL DEFAULT '{}',
      location TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON community_posts(created_at DESC);`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS atlas_favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      poi_id TEXT NOT NULL,
      name TEXT NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      address TEXT,
      tags TEXT[] NOT NULL DEFAULT '{}',
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS atlas_favorites_user_poi_idx ON atlas_favorites(user_id, poi_id);`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS atlas_checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      poi_id TEXT NOT NULL,
      name TEXT NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      address TEXT,
      tags TEXT[] NOT NULL DEFAULT '{}',
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS atlas_checkins_user_poi_idx ON atlas_checkins(user_id, poi_id);`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT,
      origin_country TEXT,
      destination_city TEXT,
      interests TEXT[] NOT NULL DEFAULT '{}',
      impression_tags TEXT[] NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS studio_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      image TEXT NOT NULL,
      result JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS studio_history_user_id_idx ON studio_history(user_id, created_at DESC);`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS itineraries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      form_data JSONB NOT NULL,
      days_data JSONB NOT NULL,
      summary TEXT NOT NULL,
      total_spots INTEGER NOT NULL,
      total_budget INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS itineraries_user_id_idx ON itineraries(user_id);`);
  await db.query(`CREATE INDEX IF NOT EXISTS itineraries_created_at_idx ON itineraries(created_at DESC);`);
};

export const closeDb = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
