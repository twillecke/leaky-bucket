// src/routes/pix.ts
import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import PixService from '../services/PixService';
import BucketStorage from '../services/bucketStorage';
import LeakyBucketService from '../services/LeackyBucketService';


const router = new Router();
const bucketStorage = new BucketStorage();
const leakyBucketService = new LeakyBucketService(bucketStorage);

router.get('/pix', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.id;
  const wasSuccessful = await PixService.handleRequest();
  const { tokensLeft } = await leakyBucketService.handleBucket(userId, wasSuccessful);
  ctx.body = {
    message: wasSuccessful ? 'Request successful' : 'Request failed and token deducted',
    tokensLeft,
  };
});

export default router;
