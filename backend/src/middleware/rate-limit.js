import { RateLimitError } from "../errors/app-error.js";

const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 30, keyPrefix = "global" } = {}) {
  return (req, _res, next) => {
    const identity = req.user?.id || req.ip || "anonymous";
    const key = `${keyPrefix}:${identity}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || now - current.startedAt > windowMs) {
      buckets.set(key, { count: 1, startedAt: now });
      next();
      return;
    }

    current.count += 1;
    if (current.count > max) {
      next(new RateLimitError());
      return;
    }

    next();
  };
}

export function resetRateLimits() {
  buckets.clear();
}
