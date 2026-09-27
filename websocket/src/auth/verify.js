import { verifyToken } from "@clerk/backend";
import { config } from "../config.js";

export async function verifyConnection(request) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const token = url.searchParams.get("token");
  const projectId = url.searchParams.get("projectId");

  if (!token || !projectId) {
    return { ok: false, status: 401, message: "Missing collaboration credentials" };
  }
  if (!config.clerkSecretKey) {
    return { ok: false, status: 500, message: "Collaboration auth is not configured" };
  }

  try {
    const claims = await verifyToken(token, { secretKey: config.clerkSecretKey });
    const response = await fetch(`${config.apiUrl}/api/internal/collaboration/${projectId}`, {
      headers: {
        authorization: `Bearer ${token}`,
        "x-devlyst-clerk-id": claims.sub,
      },
    });

    if (!response.ok) {
      return { ok: false, status: response.status, message: "Project access denied" };
    }

    const body = await response.json();
    return {
      ok: true,
      projectId,
      roomCode: body.data.roomCode,
      userId: body.data.userId,
      clerkId: claims.sub,
    };
  } catch {
    return { ok: false, status: 401, message: "Invalid collaboration credentials" };
  }
}
