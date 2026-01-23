import type { FastifyReply, FastifyRequest } from 'fastify';
import { getPool } from '../db.js';
import { fail } from './response.js';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

export const getAuthUser = async (request: FastifyRequest): Promise<AuthUser | null> => {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const db = getPool();
  const result = await db.query(
    `SELECT u.id, u.email, u.username
     FROM users u
     JOIN sessions s ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token],
  );

  if (result.rowCount === 0) return null;
  return result.rows[0] as AuthUser;
};

export const requireAuthUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthUser | null> => {
  const user = await getAuthUser(request);
  if (!user) {
    reply.status(401).send(fail('Unauthorized'));
    return null;
  }
  return user;
};
