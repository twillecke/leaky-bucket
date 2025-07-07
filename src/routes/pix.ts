// src/routes/pix.ts
import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import PixService from '../services/PixService';
import LeakyBucketService from '../services/LeackyBucketService';
import BucketStorage from '../services/BucketStorage';

const router = new Router();
const bucketStorage = new BucketStorage();
const leakyBucketService = new LeakyBucketService(bucketStorage);

router.post('/pix', authMiddleware, async (ctx) => {
  const body = ctx.request.body as { pixId?: string };
  const pixId = body.pixId;
  if (!pixId) {
    ctx.status = 400;
    ctx.body = { error: 'pixId is required' };
    return;
  }
  const userId = ctx.state.user.id;

  // Fetch bucket info for headers
  const bucketInfo = await leakyBucketService.getBucketInfo(userId);

  const canProceed = await leakyBucketService.hasAvailableTokens(userId);
  if (!canProceed) {
    ctx.status = 429;
    ctx.set('X-RateLimit-Limit', bucketInfo.limit.toString());
    ctx.set('X-RateLimit-Remaining', bucketInfo.remaining.toString());
    ctx.set('X-RateLimit-Reset', bucketInfo.reset.toString());
    ctx.body = { error: 'Rate limit exceeded' };
    return;
  }

  const wasSuccessful = await PixService.handleRequest(pixId);
  const { tokensLeft } = await leakyBucketService.handleBucketAfterRequest(userId, wasSuccessful);

  // Update bucket info after request
  const updatedBucketInfo = await leakyBucketService.getBucketInfo(userId);

  ctx.set('X-RateLimit-Limit', updatedBucketInfo.limit.toString());
  ctx.set('X-RateLimit-Remaining', updatedBucketInfo.remaining.toString());
  ctx.set('X-RateLimit-Reset', updatedBucketInfo.reset.toString());

  ctx.body = {
    message: wasSuccessful ? 'Request successful' : 'Request failed and token deducted',
    tokensLeft,
  };
});

export default router;
