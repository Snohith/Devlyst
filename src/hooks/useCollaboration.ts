import { useState, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useCollaboration(roomId: string) {
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roomId || typeof window === "undefined") return;

        setStatus("connecting");
        const ydoc = new Y.Doc();

        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const hostname = process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname;
        const port = process.env.NEXT_PUBLIC_WS_PORT || "1234"; // Default dev port

        // Construct URL: If explicit URL provided in env, use it, else build from parts
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}://${hostname}:${port}`;

        const wsProvider = new WebsocketProvider(
            wsUrl,
            roomId,
            ydoc
        );

        // Connection Handlers
        wsProvider.on('status', (event: { status: string }) => {
            setStatus(event.status as ConnectionStatus);
            if (event.status === 'connected') {
                setError(null);
            }
        });

        wsProvider.on('connection-error', (err: any) => {
            setStatus("error");
            setError(new Error("Connection failed"));
            console.error("WebSocket connection error:", err);
        });

        // Sync state
        setDoc(ydoc);
        setProvider(wsProvider);

        return () => {
            // Graceful shutdown
            wsProvider.disconnect();
            wsProvider.destroy();
            ydoc.destroy();
        };
    }, [roomId]);

    return { doc, provider, status, error };
}
