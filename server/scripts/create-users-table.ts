import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: '.env.server' });

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

const parsePort = (value: string) => {
  const port = Number(value);
  if (Number.isNaN(port)) throw new Error(`Invalid PGPORT: ${value}`);
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

const createUsersTable = async () => {
  const dbName = getEnv('PGDATABASE', 'boundless_lens');
  const client = makeClient(dbName);
  
  await client.connect();
  
  try {
    console.log('Creating users table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ Users table created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    
    console.log('✅ Indexes created');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ Sessions table created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `);
    
    console.log('✅ Session indexes created');
    
  } finally {
    await client.end();
  }
};

createUsersTable()
  .then(() => {
    console.log('\n✨ User authentication tables ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to create users table:');
    console.error(error);
    process.exit(1);
  });
