import { useEffect } from "react";
import { WebsocketProvider } from "y-websocket";

export function useCursorBroadcasting(
    editor: any,
    provider: WebsocketProvider | null,
    user: { name: string; color: string }
) {
    // 1. Set Local User State (Identity)
    useEffect(() => {
        if (!provider) return;

        // Update user identity in awareness
        provider.awareness.setLocalStateField("user", user);
    }, [provider, user.name, user.color]);

    // 2. Broadcast Cursor Position (Throttled)
    useEffect(() => {
        if (!editor || !provider) return;

        let lastUpdate = 0;
        const THROTTLE_MS = 100;

        const updatePosition = () => {
            const now = Date.now();
            if (now - lastUpdate < THROTTLE_MS) return;

            lastUpdate = now;
            const pos = editor.getPosition();

            if (pos) {
                provider.awareness.setLocalStateField("cursorLocation", {
                    lineNumber: pos.lineNumber,
                    column: pos.column
                });
            }
        };

        const disposable = editor.onDidChangeCursorPosition(updatePosition);
        return () => disposable.dispose();
    }, [editor, provider]);
}
