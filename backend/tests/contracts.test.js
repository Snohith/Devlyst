import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILE_CONTENT,
  DEFAULT_FILE_NAME,
  EXTENSION_TO_LANGUAGE,
  PISTON_RUNTIMES,
  ROOM_CODE_PATTERN,
} from "../../shared/constants/languages.js";
import {
  createFileSchema,
  createProjectSchema,
  executionSchema,
  roomCodeSchema,
} from "../../shared/schemas/index.js";

describe("shared/constants/languages", () => {
  it("maps common extensions to editor languages", () => {
    expect(EXTENSION_TO_LANGUAGE.js).toBe("javascript");
    expect(EXTENSION_TO_LANGUAGE.py).toBe("python");
    expect(EXTENSION_TO_LANGUAGE.rs).toBe("rust");
  });

  it("exposes supported Piston runtimes", () => {
    expect(PISTON_RUNTIMES.javascript.language).toBe("javascript");
    expect(PISTON_RUNTIMES.python.language).toBe("python");
  });

  it("validates 5-digit room codes", () => {
    expect(ROOM_CODE_PATTERN.test("12345")).toBe(true);
    expect(ROOM_CODE_PATTERN.test("1234")).toBe(false);
    expect(ROOM_CODE_PATTERN.test("abcde")).toBe(false);
  });
});

describe("shared/schemas", () => {
  it("validates room code params", () => {
    expect(roomCodeSchema.safeParse({ roomCode: "99999" }).success).toBe(true);
    expect(roomCodeSchema.safeParse({ roomCode: "bad" }).success).toBe(false);
  });

  it("validates project creation", () => {
    const valid = createProjectSchema.safeParse({ name: "Demo", language: "python" });
    expect(valid.success).toBe(true);
  });

  it("rejects path traversal in file names", () => {
    const invalid = createFileSchema.safeParse({ name: "../evil.js" });
    expect(invalid.success).toBe(false);
  });

  it("requires code in execution payloads", () => {
    const valid = executionSchema.safeParse({ language: "python", code: "print(1)" });
    expect(valid.success).toBe(true);
    const invalid = executionSchema.safeParse({ language: "python", code: "" });
    expect(invalid.success).toBe(false);
  });
});
