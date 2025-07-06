import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = new Koa();
const router = new Router();

router.get('/auth', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.id;
  ctx.body = { message: 'Authorized', userId };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT;
app.listen(PORT);