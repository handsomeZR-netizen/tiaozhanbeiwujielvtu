import type { FastifyInstance, FastifyRequest } from 'fastify';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../db.js';
import { ok, fail } from '../utils/response.js';

const hashPassword = (password: string, salt: string): string => {
  return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};

const generateSalt = (): string => {
  return randomBytes(16).toString('hex');
};

const generateToken = (): string => {
  return randomBytes(32).toString('hex');
};

const verifyPassword = (password: string, hash: string): boolean => {
  const [salt, storedHash] = hash.split(':');
  const testHash = hashPassword(password, salt);
  return testHash === storedHash;
};

type RegisterBody = {
  email: string;
  password: string;
  username: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export const registerAuthRoutes = async (app: FastifyInstance) => {
  // 注册
  app.post('/auth/register', async (request, reply) => {
    const body = request.body as RegisterBody;
    
    if (!body.email || !body.password || !body.username) {
      reply.status(400);
      return fail('Email, password and username are required');
    }
    
    if (body.password.length < 6) {
      reply.status(400);
      return fail('Password must be at least 6 characters');
    }
    
    const db = getPool();
    
    try {
      // 检查邮箱是否已存在
      const existingEmail = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [body.email.toLowerCase()]
      );
      
      if (existingEmail.rows.length > 0) {
        reply.status(409);
        return fail('Email already registered');
      }
      
      // 检查用户名是否已存�?
      const existingUsername = await db.query(
        'SELECT id FROM users WHERE username = $1',
        [body.username]
      );
      
      if (existingUsername.rows.length > 0) {
        reply.status(409);
        return fail('Username already taken');
      }
      
      // 创建用户
      const userId = uuidv4();
      const salt = generateSalt();
      const passwordHash = `${salt}:${hashPassword(body.password, salt)}`;
      
      await db.query(
        `INSERT INTO users (id, email, password_hash, username, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [userId, body.email.toLowerCase(), passwordHash, body.username]
      );
      
      // 创建会话
      const sessionId = uuidv4();
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30�?
      
      await db.query(
        `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [sessionId, userId, token, expiresAt]
      );
      
      return ok({
        user: {
          id: userId,
          email: body.email.toLowerCase(),
          username: body.username,
        },
        token,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error: any) {
      app.log.error(error);
      reply.status(500);
      return fail('Registration failed');
    }
  });
  
  // 登录
  app.post('/auth/login', async (request, reply) => {
    const body = request.body as LoginBody;
    
    if (!body.email || !body.password) {
      reply.status(400);
      return fail('Email and password are required');
    }
    
    const db = getPool();
    
    try {
      const result = await db.query(
        'SELECT id, email, username, password_hash, avatar_url, bio FROM users WHERE email = $1',
        [body.email.toLowerCase()]
      );
      
      if (result.rows.length === 0) {
        reply.status(401);
        return fail('Invalid email or password');
      }
      
      const user = result.rows[0];
      
      if (!verifyPassword(body.password, user.password_hash)) {
        reply.status(401);
        return fail('Invalid email or password');
      }
      
      // 创建新会�?
      const sessionId = uuidv4();
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30�?
      
      await db.query(
        `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [sessionId, user.id, token, expiresAt]
      );
      
      return ok({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatar_url,
          bio: user.bio,
        },
        token,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error: any) {
      app.log.error(error);
      reply.status(500);
      return fail('Login failed');
    }
  });
  
  // 登出
  app.post('/auth/logout', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      reply.status(401);
      return fail('No token provided');
    }
    
    const db = getPool();
    
    try {
      await db.query('DELETE FROM sessions WHERE token = $1', [token]);
      return ok({ message: 'Logged out successfully' });
    } catch (error: any) {
      app.log.error(error);
      reply.status(500);
      return fail('Logout failed');
    }
  });
  
  // 获取当前用户信息
  app.get('/auth/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      reply.status(401);
      return fail('No token provided');
    }
    
    const db = getPool();
    
    try {
      const result = await db.query(
        `SELECT u.id, u.email, u.username, u.avatar_url, u.bio, u.created_at
         FROM users u
         JOIN sessions s ON s.user_id = u.id
         WHERE s.token = $1 AND s.expires_at > NOW()`,
        [token]
      );
      
      if (result.rows.length === 0) {
        reply.status(401);
        return fail('Invalid or expired token');
      }
      
      const user = result.rows[0];
      
      return ok({
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
      });
    } catch (error: any) {
      app.log.error(error);
      reply.status(500);
      return fail('Failed to get user info');
    }
  });
};
