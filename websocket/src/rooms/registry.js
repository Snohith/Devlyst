import { setupWSConnection } from "y-websocket/bin/utils";
import * as Y from "yjs";
import { config } from "../config.js";
import { clearPersistTimer, schedulePersist } from "../persistence/files.js";

const rooms = new Map();

function roomName(projectId) {
  return `project-${projectId}`;
}

export function getRoom(projectId) {
  return rooms.get(projectId) || null;
}

export function attachConnection(connection, request, access) {
  const name = roomName(access.projectId);
  setupWSConnection(connection, request, {
    docName: name,
    gc: config.gcEnabled,
  });

  const doc = connection.doc;
  if (!doc) return;

  let room = rooms.get(access.projectId);
  if (!room) {
    room = { doc, connections: 0, token: access.token };
    const onUpdate = () => schedulePersist(access.projectId, doc, room.token);
    doc.on("update", onUpdate);
    room.onUpdate = onUpdate;
    rooms.set(access.projectId, room);
  }

  room.connections += 1;
  room.token = access.token;

  connection.on("close", () => {
    room.connections = Math.max(0, room.connections - 1);
    if (room.connections === 0) {
      doc.off("update", room.onUpdate);
      clearPersistTimer(access.projectId);
      rooms.delete(access.projectId);
    }
  });
}

export function seedDocument(projectId, files) {
  const room = rooms.get(projectId);
  if (!room) return;
  const map = room.doc.getMap("files");
  room.doc.transact(() => {
    for (const file of files) {
      if (!map.has(file.name)) {
        const text = new Y.Text();
        text.insert(0, file.content || "");
        map.set(file.name, text);
      }
    }
  });
}
