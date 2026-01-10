import { useEffect } from "react";
import { WebsocketProvider } from "y-websocket";

export function useFollowUser(
    editor: any,
    provider: WebsocketProvider | null,
    followUserId: number | null
) {
    useEffect(() => {
        if (!editor || !provider || !followUserId) return;

        const onChange = () => {
            const state: any = provider.awareness.getStates().get(followUserId);
            if (state && state.cursorLocation) {
                editor.revealPositionInCenterSmooth({
                    lineNumber: state.cursorLocation.lineNumber,
                    column: state.cursorLocation.column
                });
            }
        };

        provider.awareness.on('change', onChange);
        onChange(); // Initial jump

        return () => {
            provider.awareness.off('change', onChange);
        };
    }, [editor, provider, followUserId]);
}
