/**
 * Judge0 Community Edition client.
 *
 * The public Piston instance (emkc.org) became whitelist-only on 2026-02-15,
 * which is why every "Run Code" request used to fail with
 * "Execution failed to start.". Code execution is now delegated to the public
 * Judge0 CE API instead (no API key required).
 *
 * Language ids below were verified against https://ce.judge0.com/languages.
 */

const DEFAULT_JUDGE0_API_URL = "https://ce.judge0.com";

/** Base url of the Judge0 instance. Point JUDGE0_API_URL at a self-hosted one if needed. */
export const JUDGE0_API_URL = (
    process.env.JUDGE0_API_URL || DEFAULT_JUDGE0_API_URL
).replace(/\/+$/, "");

export interface Judge0Runtime {
    id: number;
    name: string;
}

/** Judge0 CE language ids for the languages Devlyst can execute. */
export const JUDGE0_LANGUAGES: Record<string, Judge0Runtime> = {
    javascript: { id: 93, name: "JavaScript (Node.js 18.15.0)" },
    typescript: { id: 94, name: "TypeScript (5.0.3)" },
    python: { id: 92, name: "Python (3.11.2)" },
    java: { id: 91, name: "Java (JDK 17.0.6)" },
    c: { id: 103, name: "C (GCC 14.1.0)" },
    cpp: { id: 105, name: "C++ (GCC 14.1.0)" },
    csharp: { id: 51, name: "C# (Mono 6.6.0.161)" },
    go: { id: 107, name: "Go (1.23.5)" },
    rust: { id: 108, name: "Rust (1.85.0)" },
    php: { id: 98, name: "PHP (8.3.11)" },
    ruby: { id: 72, name: "Ruby (2.7.0)" },
    sql: { id: 82, name: "SQL (SQLite 3.27.2)" },
};

// Judge0 submission status ids (subset we act on).
const STATUS_IN_QUEUE = 1;
const STATUS_PROCESSING = 2;
const STATUS_ACCEPTED = 3;
const STATUS_TIME_LIMIT_EXCEEDED = 5;
const STATUS_COMPILATION_ERROR = 6;
const STATUS_RUNTIME_ERROR_START = 7;

export const JUDGE0_LIMITS = {
    cpuTimeSeconds: 5,
    wallTimeSeconds: 10,
    memoryKb: 128_000, // 128 MB
} as const;

const REQUEST_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 400;
const MAX_WAIT_MS = 25_000;
const MAX_POLL_FAILURES = 3;

export type Judge0FailureKind =
    | "unsupported_language"
    | "invalid_request"
    | "rate_limited"
    | "timeout"
    | "unavailable";

export class Judge0Error extends Error {
    readonly kind: Judge0FailureKind;
    readonly status: number;
    readonly detail: string | null;

    constructor(
        kind: Judge0FailureKind,
        message: string,
        options: { status?: number; detail?: string | null } = {}
    ) {
        super(message);
        this.name = "Judge0Error";
        this.kind = kind;
        this.status = options.status ?? 502;
        this.detail = options.detail ?? null;
    }
}

/** Normalized execution result consumed by the API routes and the UI. */
export interface ExecutionOutcome {
    output: string;
    error: string | null;
    stderr: string | null;
    compileOutput: string | null;
    exitCode: number | null;
    signal: string | null;
    status: string;
    statusId: number;
    timeMs: number | null;
    memoryKb: number | null;
    language: string;
    runtime: string;
}

interface Judge0Position {
    id: number;
    description: string;
}

interface Judge0Submission {
    token?: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    time?: string | number | null;
    memory?: number | null;
    exit_code?: number | null;
    exit_signal?: number | null;
    status?: Judge0Position;
}

interface ExecuteOptions {
    code: string;
    language: string;
    stdin?: string;
}

/** Judge0 rejects these languages, they can still be edited/exported. */
export function getJudge0Runtime(language: string): Judge0Runtime | null {
    return JUDGE0_LANGUAGES[language] ?? null;
}

export function listExecutableLanguages(): string[] {
    return Object.keys(JUDGE0_LANGUAGES);
}

function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    // Optional: allows pointing at a RapidAPI-hosted Judge0 instance.
    const apiKey = process.env.JUDGE0_API_KEY;
    const apiHost = process.env.JUDGE0_API_HOST;
    if (apiKey) headers["X-RapidAPI-Key"] = apiKey;
    if (apiHost) headers["X-RapidAPI-Host"] = apiHost;

    return headers;
}

async function judge0Request(
    path: string,
    init: RequestInit,
    timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Judge0Submission> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
        response = await fetch(`${JUDGE0_API_URL}${path}`, {
            ...init,
            headers: {
                ...buildHeaders(),
                ...((init.headers as Record<string, string> | undefined) ?? {}),
            },
            signal: controller.signal,
            cache: "no-store",
        });
    } catch (error) {
        const aborted = (error as Error).name === "AbortError";
        throw new Judge0Error(
            aborted ? "timeout" : "unavailable",
            aborted
                ? "Code execution timed out."
                : "Code execution service is unavailable.",
            { status: 503, detail: (error as Error).message }
        );
    } finally {
        clearTimeout(timer);
    }

    if (response.status === 429) {
        throw new Judge0Error(
            "rate_limited",
            "Code execution is rate limited right now. Please retry in a few seconds.",
            { status: 429 }
        );
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Judge0Error(
            response.status === 422 ? "invalid_request" : "unavailable",
            "Code execution service rejected the request.",
            { status: 502, detail: detail.slice(0, 500) }
        );
    }

    return (await response.json()) as Judge0Submission;
}

/**
 * Submissions are created without `wait=true` and polled instead: a single
 * long-blocking request is easily cut off by proxies/edge timeouts.
 */
async function waitForResult(submission: Judge0Submission): Promise<Judge0Submission> {
    if (!submission.token) {
        throw new Judge0Error(
            "unavailable",
            "Code execution service did not accept the submission.",
            { status: 502 }
        );
    }

    // Without `wait=true` the create response only carries a token, so anything
    // that is not an explicitly finished status must still be polled.
    const statusId = submission.status?.id;
    if (statusId !== undefined && statusId !== STATUS_IN_QUEUE && statusId !== STATUS_PROCESSING) {
        return submission;
    }

    const deadline = Date.now() + MAX_WAIT_MS;
    let latest = submission;
    let failures = 0;

    while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        try {
            latest = await judge0Request(
                `/submissions/${latest.token}?base64_encoded=false`,
                { method: "GET" }
            );
            failures = 0;
        } catch (error) {
            // A few dropped polls are survivable, keep waiting for the result.
            if (++failures >= MAX_POLL_FAILURES) throw error;
            continue;
        }

        const id = latest.status?.id;
        if (id !== STATUS_IN_QUEUE && id !== STATUS_PROCESSING) {
            return latest;
        }
    }

    throw new Judge0Error(
        "timeout",
        "Execution took too long and was aborted. Check for infinite loops.",
        { status: 504 }
    );
}

function parseSeconds(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const parsed = typeof value === "number" ? value : Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function extractSignal(submission: Judge0Submission, position: Judge0Position): string | null {
    if (typeof submission.exit_signal === "number" && submission.exit_signal > 0) {
        return `signal ${submission.exit_signal}`;
    }
    const match = /SIG[A-Z]+/.exec(position.description ?? "");
    return match ? match[0] : null;
}

function deriveExitCode(submission: Judge0Submission, position: Judge0Position): number | null {
    if (typeof submission.exit_code === "number") return submission.exit_code;
    if (position.id === STATUS_ACCEPTED) return 0;
    if (position.id === STATUS_COMPILATION_ERROR || position.id >= STATUS_RUNTIME_ERROR_START) {
        return 1;
    }
    return null;
}

function buildErrorMessage(
    submission: Judge0Submission,
    position: Judge0Position,
    compileOutput: string | null,
    stderr: string | null
): string | null {
    if (compileOutput) return compileOutput;
    if (stderr) return stderr;
    if (position.id === STATUS_TIME_LIMIT_EXCEEDED) {
        return `Time limit exceeded (${JUDGE0_LIMITS.cpuTimeSeconds}s CPU).`;
    }
    if (position.id !== STATUS_ACCEPTED) {
        return submission.message || `Execution failed: ${position.description}`;
    }
    return null;
}

/** Maps a raw Judge0 submission onto the shape the app renders. */
export function normalizeSubmission(
    submission: Judge0Submission,
    language: string,
    runtime: string
): ExecutionOutcome {
    const position: Judge0Position = submission.status ?? { id: 0, description: "Unknown" };
    const stderr = submission.stderr ?? null;
    const compileOutput = submission.compile_output ?? null;
    const seconds = parseSeconds(submission.time);

    return {
        output: submission.stdout ?? "",
        error: buildErrorMessage(submission, position, compileOutput, stderr),
        stderr,
        compileOutput,
        exitCode: deriveExitCode(submission, position),
        signal: extractSignal(submission, position),
        status: position.description,
        statusId: position.id,
        timeMs: seconds === null ? null : Math.round(seconds * 1000),
        memoryKb: submission.memory ?? null,
        language,
        runtime,
    };
}

/** Creates a submission; retries once because the public instance can drop a connection. */
async function createSubmission(body: string): Promise<Judge0Submission> {
    const path = "/submissions?base64_encoded=false&wait=false";
    try {
        return await judge0Request(path, { method: "POST", body });
    } catch (error) {
        if (
            error instanceof Judge0Error &&
            (error.kind === "timeout" || error.kind === "unavailable")
        ) {
            return judge0Request(path, { method: "POST", body });
        }
        throw error;
    }
}

/**
 * Submits code to Judge0 and resolves with a normalized result.
 * Throws a `Judge0Error` when the request itself could not be completed.
 */
export async function executeWithJudge0({
    code,
    language,
    stdin = "",
}: ExecuteOptions): Promise<ExecutionOutcome> {
    const runtime = getJudge0Runtime(language);
    if (!runtime) {
        throw new Judge0Error(
            "unsupported_language",
            "This language cannot be executed.",
            { status: 400 }
        );
    }

    const submission = await createSubmission(
        JSON.stringify({
            language_id: runtime.id,
            source_code: code,
            stdin,
            cpu_time_limit: JUDGE0_LIMITS.cpuTimeSeconds,
            wall_time_limit: JUDGE0_LIMITS.wallTimeSeconds,
            memory_limit: JUDGE0_LIMITS.memoryKb,
            redirect_stderr_to_stdout: false,
        })
    );

    const completed = await waitForResult(submission);
    return normalizeSubmission(completed, language, runtime.name);
}
