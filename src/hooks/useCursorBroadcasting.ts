import { useEffect } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { WebsocketProvider } from "y-websocket";

export function useCursorBroadcasting(
    editor: MonacoEditor.IStandaloneCodeEditor | null,
    provider: WebsocketProvider | null,
    user: { name: string; color: string }
) {
    // Publish who we are so other clients can label our cursor.
    useEffect(() => {
        if (!provider) return;

        provider.awareness.setLocalStateField("user", user);
    }, [provider, user]);

    // Broadcast the caret position, throttled to keep awareness traffic small.
    useEffect(() => {
        if (!editor || !provider) return;

        let lastUpdate = 0;
        const throttleMs = 100;

        const updatePosition = () => {
            const now = Date.now();
            if (now - lastUpdate < throttleMs) return;

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
