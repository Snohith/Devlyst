import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { logger } from "./utils/logger.js";

const app = createApp();
const server = app.listen(env.port, () => {
  logger.info("api listening", { port: env.port, env: env.nodeEnv });
});

async function shutdown(signal) {
  logger.info("api shutting down", { signal });
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
