import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

/**
 * Builds the WebSocket url of the Yjs server.
 *
 * NEXT_PUBLIC_WS_URL wins when it is set. Otherwise the url is derived from the
 * host/port pair so the same build works locally (ws://localhost:1234) and on
 * Render (wss://devlyst-ws.onrender.com).
 */
function resolveSocketUrl() {
    if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const configuredHost = process.env.NEXT_PUBLIC_WS_HOST;
    // Render injects the internal service name; the browser needs the public one.
    const host = configuredHost === "devlyst-ws"
        ? "devlyst-ws.onrender.com"
        : configuredHost || window.location.hostname;
    const port = process.env.NEXT_PUBLIC_WS_PORT;
    const portSuffix = port && port !== "443" && port !== "80" ? `:${port}` : "";

    return `${protocol}://${host}${portSuffix}`;
}

export function useCollaboration(roomId: string) {
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("connecting");
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roomId || typeof window === "undefined") return;

        const ydoc = new Y.Doc();
        const socket = new WebsocketProvider(resolveSocketUrl(), roomId, ydoc);

        socket.on("status", (event: { status: string }) => {
            setStatus(event.status as ConnectionStatus);
            if (event.status === "connected") setError(null);
        });

        socket.on("connection-error", () => {
            setStatus("error");
            setError(new Error("Could not reach the collaboration server."));
        });

        setDoc(ydoc);
        setProvider(socket);

        return () => {
            socket.destroy();
            ydoc.destroy();
        };
    }, [roomId]);

    return { doc, provider, status, error };
}
