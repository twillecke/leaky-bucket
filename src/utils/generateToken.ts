import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;

/**
 * Generates a JWT token for a given user ID.
 */
export function generateToken(userId: string) {
  const result = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  return result;
}
