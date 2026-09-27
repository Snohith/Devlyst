import { NextResponse } from 'next/server';
import { isRateLimited, validateOrigin } from '@/lib/security';

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

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

    try {
        const { code, language } = await request.json();

        // Map internal language names to Piston runtimes
        const runtimeMap: { [key: string]: { language: string, version: string } } = {
            javascript: { language: "javascript", version: "18.15.0" },
            typescript: { language: "typescript", version: "5.0.3" },
            python: { language: "python", version: "3.10.0" },
            java: { language: "java", version: "15.0.2" },
            c: { language: "c", version: "10.2.0" },
            cpp: { language: "c++", version: "10.2.0" },
            go: { language: "go", version: "1.16.2" },
            rust: { language: "rust", version: "1.68.2" },
            php: { language: "php", version: "8.2.3" },
        };

        const config = runtimeMap[language] || runtimeMap.javascript;

        const response = await fetch(PISTON_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: config.language,
                version: config.version,
                files: [
                    {
                        content: code
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.run) {
            return NextResponse.json({
                output: data.run.output,
                error: data.run.stderr || null
            });
        }

        return NextResponse.json({ output: "", error: "Execution failed to start." });

    } catch (err) {
        console.error("Execution Error:", err);
        return NextResponse.json({ error: "Server error during execution" }, { status: 500 });
    }
}
