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

        // Reset status on room change

        setTimeout(() => setStatus("connecting"), 0);

        const ydoc = new Y.Doc();
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";

        // ... (truncated for brevity in thought, but must be full content in tool)
        // Actually I should just use multi_replace for precision.


        // If NEXT_PUBLIC_WS_HOST is set to the internal Render service name "devlyst-ws",
        // automatically append .onrender.com for client-side access.
        let hostname = process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname;
        if (hostname === "devlyst-ws") {
            hostname = "devlyst-ws.onrender.com";
        }
        const port = process.env.NEXT_PUBLIC_WS_PORT;

        // If port is present and NON-standard, append it. 
        // Render/Prod usually uses 443 (implicit), so portSuffix is empty.
        const portSuffix = (port && port !== "443" && port !== "80") ? `:${port}` : "";

        // Critical Fix: Construct full base URL.
        // If hostname is "devlyst-ws", valid URL is "wss://devlyst-ws..."
        const defaultUrl = `${protocol}://${hostname}${portSuffix}`;

        // Ensure we don't have double protocols if env var includes it
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultUrl;

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

        wsProvider.on('connection-error', (err: unknown) => {
            setStatus("error");
            setError(new Error("Connection failed"));
            console.error("WebSocket connection error:", err);
        });

        // Sync state
        setTimeout(() => {
            setDoc(ydoc);
            setProvider(wsProvider);
        }, 0);

        return () => {
            // Graceful shutdown
            wsProvider.disconnect();
            wsProvider.destroy();
            ydoc.destroy();
        };
    }, [roomId]);

    return { doc, provider, status, error };
}
