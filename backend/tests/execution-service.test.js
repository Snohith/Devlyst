import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/execution-repository.js", () => ({
  executionRepository: { create: vi.fn().mockResolvedValue({ id: 1 }) },
}));

import { executionRepository } from "../src/repositories/execution-repository.js";
import { executeCode } from "../src/services/execution-service.js";

const submission = (overrides = {}) => ({
  token: "token-1",
  stdout: "hello\n",
  stderr: null,
  compile_output: null,
  exit_code: 0,
  time: "0.261",
  memory: 4096,
  status: { id: 3, description: "Accepted" },
  ...overrides,
});

/** Stubs global fetch with a Judge0-like create endpoint plus queued poll responses. */
function stubJudge0(pollResponses) {
  const calls = [];
  const queue = [...pollResponses];

  vi.stubGlobal("fetch", async (url, init = {}) => {
    const target = String(url);
    calls.push({ url: target, method: init.method, body: init.body });

    const payload = target.includes("/submissions?") ? { token: "token-1" } : queue.shift();

    return {
      ok: true,
      status: 200,
      json: async () => payload,
      text: async () => "",
    };
  });

  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("execution-service (Judge0)", () => {
  it("creates a submission, polls it and normalizes the result", async () => {
    const calls = stubJudge0([{ status: { id: 2, description: "Processing" } }, submission()]);

    const result = await executeCode({ id: 7 }, { language: "python", code: "print('hello')" });

    const create = calls.find((call) => call.method === "POST");
    expect(create.url).toContain("/submissions?base64_encoded=false&wait=false");
    expect(create.body).toContain('"language_id":92');
    expect(create.body).toContain('"source_code":"print(\'hello\')"');
    expect(calls.filter((call) => call.method === "GET")).toHaveLength(2);

    expect(result).toMatchObject({
      language: "python",
      version: "3.11.2",
      runtime: "Python (3.11.2)",
      output: "hello\n",
      error: null,
      exitCode: 0,
      status: "Accepted",
      statusId: 3,
      timeMs: 261,
      memoryKb: 4096,
    });
    expect(executionRepository.create).toHaveBeenCalledOnce();
  });

  it("surfaces compile errors that Judge0 returns with HTTP 200", async () => {
    stubJudge0([
      submission({
        stdout: "",
        exit_code: null,
        compile_output: "main.cpp:1:14: error: 'foo' was not declared",
        status: { id: 6, description: "Compilation Error" },
      }),
    ]);

    const result = await executeCode({ id: 7 }, { language: "cpp", code: "int main() {}" });

    expect(result.output).toBe("");
    expect(result.error).toContain("was not declared");
    expect(result.compileOutput).toContain("was not declared");
    expect(result.exitCode).toBe(1);
    expect(result.statusId).toBe(6);
  });

  it("rejects languages without a Judge0 runtime before calling the API", async () => {
    const calls = stubJudge0([]);

    await expect(
      executeCode({ id: 7 }, { language: "html", code: "<h1>hi</h1>" })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR", status: 422 });

    expect(calls).toHaveLength(0);
    expect(executionRepository.create).not.toHaveBeenCalled();
  });
});
