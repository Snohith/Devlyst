import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors/app-error.js";
import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export function notFound(_req, _res, next) {
  next(new AppError("Route not found", { status: 404, code: "ROUTE_NOT_FOUND" }));
}

export function errorHandler(error, req, res, _next) {
  const normalized = error instanceof ZodError
    ? new ValidationError("Request validation failed", error.issues)
    : error;

  const status = normalized.status || 500;
  if (status >= 500) {
    logger.error("request failed", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      code: normalized.code,
    });
  }

  return sendError(res, normalized);
}
