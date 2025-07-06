import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;

export async function authMiddleware(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'Missing or invalid Authorization header' };
    return;
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    ctx.state.user = {
      id: decoded.userId,
    };
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid or expired token' };
  }
}
