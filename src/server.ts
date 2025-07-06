import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import BucketStorage from './services/bucketStorage';
import LeakyBucketService from './services/LeackyBucketService';
import PixService from './services/PixService';

dotenv.config();
const app = new Koa();
const router = new Router();

const bucketStorage = new BucketStorage();
const leakyBucketService = new LeakyBucketService(bucketStorage);

router.get('/pix', authMiddleware, async (ctx) => {
  router.get('/pix', authMiddleware, async (ctx) => {
    const userId = ctx.state.user.id;
    const wasSuccessful = await PixService.handleRequest();
    const { tokensLeft } = await leakyBucketService.handleBucket(userId, wasSuccessful);
    ctx.body = {
      message: wasSuccessful ? 'Request successful' : 'Request failed and token deducted',
      tokensLeft,
    };
  });

});


app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT;
app.listen(PORT);