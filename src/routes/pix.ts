// src/routes/pix.ts
import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import PixService from '../services/PixService';
import BucketStorage from '../services/bucketStorage';
import LeakyBucketService from '../services/LeackyBucketService';

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
  const canProceed = await leakyBucketService.hasAvailableTokens(userId);
  if (!canProceed) {
    ctx.status = 429;
    ctx.body = { error: 'Rate limit exceeded' };
    return;
  }
  const wasSuccessful = await PixService.handleRequest(pixId);
  const { tokensLeft } = await leakyBucketService.handleBucketAfterRequest(userId, wasSuccessful);
  ctx.body = {
    message: wasSuccessful ? 'Request successful' : 'Request failed and token deducted',
    tokensLeft,
  };
});

export default router;
