import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./utils/env";
import { initDb } from "./models/database";
import { standardLimiter } from "./middleware/rateLimit";
import routes from "./routes/index";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(standardLimiter);

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Error no manejado:", err);
    res.status(500).json({
      message:
        env.NODE_ENV === "production"
          ? "Error interno del servidor"
          : err.message,
    });
  }
);

async function start(): Promise<void> {
  await initDb();
  app.listen(env.PORT, () => {
    console.log(`CosmicVault API corriendo en http://localhost:${env.PORT}`);
    console.log(`Entorno: ${env.NODE_ENV}`);
  });
}

start();

export default app;
