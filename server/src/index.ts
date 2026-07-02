import express from "express";
import cors from "cors";
import { env } from "./env";
import { authRouter } from "./modules/auth/auth.routes";
import { studiesRouter } from "./modules/studies/studies.routes";
import { errorHandler, notFound } from "./middleware/error";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "time2rate-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/studies", studiesRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Time2Rate API in ascolto su http://localhost:${env.port}`);
});
