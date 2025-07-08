import Koa from "koa";
import bodyParser from "koa-bodyparser";
import dotenv from "dotenv";
import { metricsMiddleware } from "./metrics/middleware";
import { metricsEndpoint } from "./metrics/endpoint";
import pixRoutes from "./routes/Pix";

dotenv.config();

const app = new Koa();

app.use(metricsMiddleware);
app.use(metricsEndpoint);

app.use(bodyParser());
app.use(pixRoutes.routes());
app.use(pixRoutes.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
