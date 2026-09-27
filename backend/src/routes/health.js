import { Router } from "express";
import { prisma } from "../db/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch {
    database = "down";
  }

  res.status(database === "up" ? 200 : 503).json({
    data: {
      status: database === "up" ? "ok" : "degraded",
      database,
      service: "devlyst-api",
    },
  });
});
