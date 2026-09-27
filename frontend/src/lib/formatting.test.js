import { describe, expect, it } from "vitest";
import { formatLanguageLabel } from "./formatting.js";

describe("frontend utilities", () => {
  it("formats language labels cleanly", () => {
    expect(formatLanguageLabel("javascript")).toBe("JavaScript");
    expect(formatLanguageLabel("python")).toBe("Python");
    expect(formatLanguageLabel("unknown")).toBe("Unknown");
  });
});
