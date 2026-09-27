import { useEffect } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { WebsocketProvider } from "y-websocket";

export function useFollowUser(
    editor: MonacoEditor.IStandaloneCodeEditor | null,
    provider: WebsocketProvider | null,
    followUserId: number | null
) {
    useEffect(() => {
        if (!editor || !provider || !followUserId) return;

        const onChange = () => {
            const state = provider.awareness.getStates().get(followUserId) as
                | { cursorLocation?: { lineNumber: number; column: number } }
                | undefined;

            if (state?.cursorLocation) {
                editor.revealPositionInCenter(state.cursorLocation);
            }
        };

        provider.awareness.on('change', onChange);
        onChange();

        return () => {
            provider.awareness.off('change', onChange);
        };
    }, [editor, provider, followUserId]);
}
