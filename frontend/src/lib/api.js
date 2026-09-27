import { config } from "./config";

export class ApiError extends Error {
  constructor(message, { status = 500, code = "REQUEST_FAILED", details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.error?.message || "Request failed", {
      status: response.status,
      code: payload?.error?.code,
      details: payload?.error?.details,
    });
  }

  return payload?.data;
}
