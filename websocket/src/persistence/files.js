import * as Y from "yjs";
import { config } from "../config.js";

const timers = new Map();

export function schedulePersist(projectId, doc, token) {
  const existing = timers.get(projectId);
  if (existing) clearTimeout(existing);

  timers.set(projectId, setTimeout(() => {
    timers.delete(projectId);
    persistFiles(projectId, doc, token).catch((error) => {
      console.error(JSON.stringify({
        level: "error",
        message: "failed to persist collaborative files",
        projectId,
        error: error.message,
      }));
    });
  }, config.persistDebounceMs));
}

export async function persistFiles(projectId, doc, token) {
  const files = doc.getMap("files");
  const payload = [];

  files.forEach((value, name) => {
    if (value instanceof Y.Text) {
      payload.push({ name, content: value.toString() });
    }
  });

  if (payload.length === 0) return;

  const response = await fetch(`${config.apiUrl}/api/internal/collaboration/${projectId}/files`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ files: payload }),
  });

  if (!response.ok) {
    throw new Error(`persist failed with status ${response.status}`);
  }
}

export function clearPersistTimer(projectId) {
  const existing = timers.get(projectId);
  if (existing) clearTimeout(existing);
  timers.delete(projectId);
}
