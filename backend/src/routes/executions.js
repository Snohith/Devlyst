import { Router } from "express";
import { execute } from "../controllers/execution-controller.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { executionSchema } from "../../../shared/schemas/index.js";

export const executionRouter = Router();

executionRouter.post(
  "/",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "execute" }),
  validate({ body: executionSchema }),
  execute,
);
