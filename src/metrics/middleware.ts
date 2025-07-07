import { Context, Next } from 'koa';
import { httpRequestDuration, httpRequestsTotal } from './prometheus';

// Middleware to collect HTTP metrics
export const metricsMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = (Date.now() - start) / 1000;

  // Record metrics
  httpRequestDuration
    .labels(ctx.method, ctx.path, ctx.status.toString())
    .observe(duration);

  httpRequestsTotal
    .labels(ctx.method, ctx.path, ctx.status.toString())
    .inc();
};
