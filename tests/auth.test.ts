import { authMiddleware } from '../src/middleware/auth';
import { generateToken } from '../src/utils/generateToken';

describe('authMiddleware', () => {
  const next = jest.fn();

  it('should return 401 if no Authorization header is present', async () => {
    const ctx: any = {
      headers: {},
      status: 0,
      body: null,
      state: {},
    };

    await authMiddleware(ctx, next);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is malformed', async () => {
    const ctx: any = {
      headers: {
        authorization: 'Token something',
      },
      status: 0,
      body: null,
      state: {},
    };

    await authMiddleware(ctx, next);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    const ctx: any = {
      headers: {
        authorization: 'Bearer invalidtoken',
      },
      status: 0,
      body: null,
      state: {},
    };

    await authMiddleware(ctx, next);

    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and attach user if token is valid', async () => {
    const token = generateToken('user123');
    const ctx: any = {
      headers: {
        authorization: `Bearer ${token}`,
      },
      status: 0,
      body: null,
      state: {},
    };

    await authMiddleware(ctx, next);

    expect(ctx.status).toBe(0); // didn't override
    expect(ctx.state.user).toEqual({ id: 'user123' });
    expect(next).toHaveBeenCalled();
  });
});
