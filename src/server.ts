import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import pixRoutes from './routes/pix';
import { metricsMiddleware } from './metrics/middleware';
import { metricsEndpoint } from './metrics/endpoint';

dotenv.config();

const app = new Koa();

// Middleware to collect HTTP metrics
app.use(metricsMiddleware);

// Metrics endpoint
app.use(metricsEndpoint);

app.use(bodyParser());
app.use(pixRoutes.routes());
app.use(pixRoutes.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
