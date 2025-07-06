import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import pixRoutes from './routes/pix';

dotenv.config();

const app = new Koa();

app.use(bodyParser());
app.use(pixRoutes.routes());
app.use(pixRoutes.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
