import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { executionRouter } from "./routes/executions.js";
import { healthRouter } from "./routes/health.js";
import { projectRouter } from "./routes/projects.js";
import { userRouter } from "./routes/users.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: "200kb" }));
  app.use(requestLogger);

  app.use("/api/health", healthRouter);
  app.use("/api/users", userRouter);
  app.use("/api/projects", projectRouter);
  app.use("/api/executions", executionRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
