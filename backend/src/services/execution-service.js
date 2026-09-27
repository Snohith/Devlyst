import { PISTON_RUNTIMES } from "../../../shared/constants/languages.js";
import { env } from "../config/env.js";
import { ExternalServiceError, ValidationError } from "../errors/app-error.js";
import { executionRepository } from "../repositories/execution-repository.js";
import { assertProjectMember } from "./project-service.js";

const FILE_NAMES = {
  javascript: "script.js",
  typescript: "script.ts",
  python: "main.py",
  java: "Main.java",
  c: "main.c",
  cpp: "main.cpp",
  go: "main.go",
  rust: "main.rs",
  php: "main.php",
};

export async function executeCode(user, input) {
  const runtime = PISTON_RUNTIMES[input.language];
  if (!runtime) {
    throw new ValidationError("This language cannot be executed");
  }

  if (input.projectId) {
    await assertProjectMember(input.projectId, user);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let response;
  try {
    response = await fetch(env.pistonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ name: FILE_NAMES[input.language], content: input.code }],
        stdin: input.stdin || "",
      }),
    });
  } catch (error) {
    throw new ExternalServiceError("Code execution service is unavailable", {
      reason: error.name === "AbortError" ? "timeout" : "network",
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new ExternalServiceError("Code execution service rejected the request", {
      status: response.status,
      detail: detail.slice(0, 500),
    });
  }

  const result = await response.json();
  const run = result.run || {};
  const compile = result.compile || {};

  await executionRepository.create({
    userId: user.id,
    projectId: input.projectId || null,
    language: runtime.language,
    version: runtime.version,
    status: run.code === 0 ? "success" : "error",
    exitCode: typeof run.code === "number" ? run.code : null,
  });

  return {
    language: runtime.language,
    version: runtime.version,
    output: run.stdout || "",
    stderr: run.stderr || null,
    compileOutput: compile.stderr || compile.output || null,
    exitCode: typeof run.code === "number" ? run.code : null,
    signal: run.signal || null,
  };
}
