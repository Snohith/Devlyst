import { NextResponse } from 'next/server';
import { isRateLimited, validateOrigin } from '@/lib/security';
import {
    Judge0Error,
    JUDGE0_LANGUAGES,
    executeWithJudge0,
    getJudge0Runtime,
} from '@/lib/judge0';

// Compiling and running a submission takes a few seconds.
export const maxDuration = 30;

const MAX_SOURCE_BYTES = 100_000;

export async function POST(request: Request) {
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Behind a proxy the client address lives in x-forwarded-for; fall back to
    // x-real-ip and finally loopback so local requests are still counted.
    const forwarded = request.headers.get("x-forwarded-for")?.split(',')[0].trim();
    const ip = forwarded || request.headers.get("x-real-ip") || "127.0.0.1";

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

    // HTML and CSS stay editable in Devlyst, they just cannot be judged.
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
