import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { config } from "../lib/config";

export function useCollaboration({ projectId, token, enabled }) {
  const [status, setStatus] = useState(enabled ? "connecting" : "local");
  const [doc, setDoc] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (!enabled || !projectId || !token) {
      setStatus("local");
      setDoc(null);
      setProvider(null);
      return undefined;
    }

    const ydoc = new Y.Doc();
    const socket = new WebsocketProvider(config.websocketUrl, `project-${projectId}`, ydoc, {
      params: { token, projectId },
    });

    const onStatus = ({ status: next }) => setStatus(next);
    socket.on("status", onStatus);
    setDoc(ydoc);
    setProvider(socket);

    return () => {
      socket.off("status", onStatus);
      socket.destroy();
      ydoc.destroy();
    };
  }, [enabled, projectId, token]);

  return { status, doc, provider };
}
