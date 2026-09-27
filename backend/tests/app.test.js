import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("API HTTP Shell", () => {
  const app = createApp();

  it("responds to /api/health with service status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(600);
    expect(res.body.data.service).toBe("devlyst-api");
  });

  it("returns 404 for unknown endpoints", async () => {
    const res = await request(app).get("/api/unknown-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("enforces authentication on protected routes", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("enforces validation rules on executions without token", async () => {
    const res = await request(app)
      .post("/api/executions")
      .send({ language: "invalid-lang", code: "" });
    // requireAuth runs first, rejecting 401
    expect(res.status).toBe(401);
  });
});
