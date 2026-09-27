import { JUDGE0_LANGUAGES } from "../../../shared/constants/languages.js";
import { env } from "../config/env.js";
import { ExternalServiceError, RateLimitError, ValidationError } from "../errors/app-error.js";
import { executionRepository } from "../repositories/execution-repository.js";
import { assertProjectMember } from "./project-service.js";

// Judge0 submission status ids (subset we act on).
const STATUS_IN_QUEUE = 1;
const STATUS_PROCESSING = 2;
const STATUS_ACCEPTED = 3;
const STATUS_TIME_LIMIT_EXCEEDED = 5;
const STATUS_COMPILATION_ERROR = 6;
const STATUS_RUNTIME_ERROR_START = 7;

const LIMITS = {
  cpuTimeSeconds: 5,
  wallTimeSeconds: 10,
  memoryKb: 128_000, // 128 MB
};

const REQUEST_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 400;
const MAX_WAIT_MS = 25_000;
const MAX_POLL_FAILURES = 3;

function buildHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (env.judge0ApiKey) headers["X-RapidAPI-Key"] = env.judge0ApiKey;
  if (env.judge0ApiHost) headers["X-RapidAPI-Host"] = env.judge0ApiHost;

  return headers;
}

async function judge0Request(path, init, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${env.judge0ApiUrl}${path}`, {
      ...init,
      headers: { ...buildHeaders(), ...(init.headers || {}) },
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error.name === "AbortError";
    throw new ExternalServiceError("Code execution service is unavailable", {
      reason: timedOut ? "timeout" : "network",
    });
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new RateLimitError("Code execution is rate limited, please retry shortly");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ExternalServiceError("Code execution service rejected the request", {
      status: response.status,
      detail: detail.slice(0, 500),
    });
  }

  return response.json();
}

/**
 * Judge0 submissions are created without `wait=true` and polled instead:
 * a single long-blocking request is easily cut off by proxies/edge timeouts.
 */
async function waitForResult(submission) {
  if (!submission?.token) {
    throw new ExternalServiceError("Code execution service did not accept the submission");
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
      latest = await judge0Request(`/submissions/${latest.token}?base64_encoded=false`, {
        method: "GET",
      });
      failures = 0;
    } catch (error) {
      // A few dropped polls are survivable, keep waiting for the result.
      if (++failures >= MAX_POLL_FAILURES) throw error;
      continue;
    }

    const id = latest?.status?.id;
    if (id !== STATUS_IN_QUEUE && id !== STATUS_PROCESSING) {
      return latest;
    }
  }

  throw new ExternalServiceError("Code execution took too long and was aborted", {
    reason: "timeout",
  });
}

/** Creates a submission; retries once because the public instance can drop a connection. */
async function createSubmission(body) {
  const path = "/submissions?base64_encoded=false&wait=false";

  try {
    return await judge0Request(path, { method: "POST", body });
  } catch (error) {
    if (error.code === "EXTERNAL_SERVICE_ERROR" && error.details?.reason) {
      return judge0Request(path, { method: "POST", body });
    }
    throw error;
  }
}

function parseSeconds(value) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Extracts "3.11.2" out of "Python (3.11.2)". */
function runtimeVersion(runtime) {
  const match = /\(([^)]+)\)/.exec(runtime.name || "");
  return match ? match[1] : runtime.name;
}

function extractSignal(submission, status) {
  if (typeof submission.exit_signal === "number" && submission.exit_signal > 0) {
    return `signal ${submission.exit_signal}`;
  }
  const match = /SIG[A-Z]+/.exec(status?.description || "");
  return match ? match[0] : null;
}

function deriveExitCode(submission, status) {
  if (typeof submission.exit_code === "number") return submission.exit_code;
  if (status?.id === STATUS_ACCEPTED) return 0;
  if (status?.id === STATUS_COMPILATION_ERROR || status?.id >= STATUS_RUNTIME_ERROR_START) return 1;
  return null;
}

function buildErrorMessage(submission, status, compileOutput, stderr) {
  if (compileOutput) return compileOutput;
  if (stderr) return stderr;
  if (status?.id === STATUS_TIME_LIMIT_EXCEEDED) {
    return `Time limit exceeded (${LIMITS.cpuTimeSeconds}s CPU).`;
  }
  if (status?.id !== STATUS_ACCEPTED) {
    return submission.message || `Execution failed: ${status?.description || "Unknown error"}`;
  }
  return null;
}

function normalizeSubmission(submission, language, runtime) {
  const status = submission.status || { id: 0, description: "Unknown" };
  const stderr = submission.stderr || null;
  const compileOutput = submission.compile_output || null;
  const seconds = parseSeconds(submission.time);

  return {
    language,
    version: runtimeVersion(runtime),
    runtime: runtime.name,
    output: submission.stdout || "",
    error: buildErrorMessage(submission, status, compileOutput, stderr),
    stderr,
    compileOutput,
    exitCode: deriveExitCode(submission, status),
    signal: extractSignal(submission, status),
    status: status.description,
    statusId: status.id,
    timeMs: seconds === null ? null : Math.round(seconds * 1000),
    memoryKb: submission.memory ?? null,
  };
}

/**
 * Runs code through the Judge0 Community Edition API.
 * Replaces the retired public Piston instance (whitelist only since 2026-02-15).
 */
export async function executeCode(user, input) {
  const runtime = JUDGE0_LANGUAGES[input.language];
  if (!runtime) {
    throw new ValidationError("This language cannot be executed");
  }

  if (input.projectId) {
    await assertProjectMember(input.projectId, user);
  }

  const submission = await createSubmission(
    JSON.stringify({
      language_id: runtime.id,
      source_code: input.code,
      stdin: input.stdin || "",
      cpu_time_limit: LIMITS.cpuTimeSeconds,
      wall_time_limit: LIMITS.wallTimeSeconds,
      memory_limit: LIMITS.memoryKb,
      redirect_stderr_to_stdout: false,
    })
  );

  const completed = await waitForResult(submission);
  const result = normalizeSubmission(completed, input.language, runtime);

  await executionRepository.create({
    userId: user.id,
    projectId: input.projectId || null,
    language: result.language,
    version: result.version,
    status: result.statusId === STATUS_ACCEPTED ? "success" : "error",
    exitCode: typeof result.exitCode === "number" ? result.exitCode : null,
  });

  return result;
}

