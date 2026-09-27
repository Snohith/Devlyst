import { NextResponse } from 'next/server';
import { isRateLimited, validateOrigin } from '@/lib/security';
import {
    Judge0Error,
    JUDGE0_LANGUAGES,
    executeWithJudge0,
    getJudge0Runtime,
} from '@/lib/judge0';

// Judge0 submissions (compile + run) can take a few seconds.
export const maxDuration = 30;

const MAX_SOURCE_BYTES = 100_000;

export async function POST(request: Request) {
    // 1. Validate Origin
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Rate Limit
    // Use multiple headers to try and find a real IP, but prefer X-Forwarded-For if available.
    // In a real prod environment (Vercel, AWS), trust the platform's standard headers.
    let ip = request.headers.get("x-forwarded-for")?.split(',')[0].trim();

    // Fallback for local development or direct access
    if (!ip) {
        const realIp = request.headers.get("x-real-ip");
        ip = realIp || "127.0.0.1";
    }

    if (isRateLimited(ip)) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    let payload: { code?: unknown; language?: unknown; stdin?: unknown };
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const code = typeof payload.code === "string" ? payload.code : "";
    const language = typeof payload.language === "string" ? payload.language : "javascript";
    const stdin = typeof payload.stdin === "string" ? payload.stdin : "";

    if (!code.trim()) {
        return NextResponse.json({ error: "Nothing to run - the editor is empty." }, { status: 400 });
    }

    if (Buffer.byteLength(code, "utf8") > MAX_SOURCE_BYTES) {
        return NextResponse.json(
            { error: "Source code is too large to execute (limit: 100 KB)." },
            { status: 400 }
        );
    }

    // HTML/CSS are editable in Devlyst but cannot be executed by a judge.
    if (!getJudge0Runtime(language)) {
        return NextResponse.json(
            {
                error: `Languages that can be executed: ${Object.keys(JUDGE0_LANGUAGES)
                    .map((key) => JUDGE0_LANGUAGES[key].name)
                    .join(", ")}.`,
            },
            { status: 400 }
        );
    }

    // 3. Execute through Judge0 (replaces the retired public Piston API).
    try {
        const result = await executeWithJudge0({ code, language, stdin });

        return NextResponse.json({
            output: result.output,
            error: result.error,
            stderr: result.stderr,
            compileOutput: result.compileOutput,
            exitCode: result.exitCode,
            signal: result.signal,
            status: result.status,
            timeMs: result.timeMs,
            memoryKb: result.memoryKb,
            language: result.language,
            runtime: result.runtime,
        });
    } catch (err) {
        if (err instanceof Judge0Error) {
            console.error("Execution Error:", err.kind, err.detail ?? err.message);
            return NextResponse.json(
                { output: "", error: err.message, status: err.kind },
                { status: err.status }
            );
        }

        console.error("Execution Error:", err);
        return NextResponse.json({ error: "Server error during execution" }, { status: 500 });
    }
}
