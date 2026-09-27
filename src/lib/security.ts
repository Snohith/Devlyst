export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
export const MAX_REQUESTS_PER_WINDOW = 20;

const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

export function isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record) {
        rateLimitStore.set(identifier, { count: 1, lastReset: now });
        return false;
    }

    if (now - record.lastReset > RATE_LIMIT_WINDOW) {
        record.count = 1;
        record.lastReset = now;
        return false;
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return true;
    }

    record.count++;
    return false;
}

export function validateOrigin(request: Request): boolean {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    // In strict mode, we expect calls from our own domain.
    // Allow if origin matches configured URL or null (server-side calls might lack it, though usually client sends it)
    if (!origin && !referer) return true; // S2S or specific cases

    const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") // Remove trailing slash if present
    ].filter((url): url is string => !!url);

    if (origin && !allowedOrigins.includes(origin)) return false;

    // Basic referer check - allow if it starts with any allowed origin
    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) return false;

    return true;
}
