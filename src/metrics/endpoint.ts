import { Context, Next } from 'koa';
import { register } from './prometheus';

// Metrics endpoint middleware
export const metricsEndpoint = async (ctx: Context, next: Next) => {
  if (ctx.path === '/metrics') {
    ctx.set('Content-Type', register.contentType);
    ctx.body = await register.metrics();
    return;
  }
  await next();
};
