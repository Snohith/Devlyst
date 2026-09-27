"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { initVimMode } from "monaco-vim";
import { cn } from "@/lib/utils";
import type { Collaborator, MonacoApi, MonacoEditor } from "@/lib/collaboration";
import { useCursorBroadcasting } from "@/hooks/useCursorBroadcasting";
import { useFollowUser } from "@/hooks/useFollowUser";

// Color palette for remote cursors and selection highlights.
const USER_COLORS = [
    "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6",
];

interface CollaborativeEditorProps {
    className?: string;
    defaultValue?: string;
    onEditorMount?: (editor: MonacoEditor, monaco: MonacoApi) => void;
    onAwarenessChange?: (users: Collaborator[]) => void;
    language?: string;
    onLanguageChange?: (lang: string) => void;
    followUserId?: number | null;
    isVimMode?: boolean;
    doc: Y.Doc | null;
    provider: WebsocketProvider | null;
    filename: string;
    userName: string;
}

export default function CollaborativeEditor({
    className,
    defaultValue = "// Start coding together...",
    onEditorMount,
    onAwarenessChange,
    onLanguageChange,
    language = "javascript",
    isVimMode = false,
    followUserId = null,
    doc,
    provider,
    filename,
    userName
}: CollaborativeEditorProps) {
    const [editorRef, setEditorRef] = useState<MonacoEditor | null>(null);
    const [monacoRef, setMonacoRef] = useState<MonacoApi | null>(null);
    const [yMap, setYMap] = useState<Y.Map<unknown> | null>(null);

    const vimModeRef = useRef<ReturnType<typeof initVimMode> | null>(null);
    const statusNodeRef = useRef<HTMLDivElement>(null);

    // The cursor color is picked once per session; the name can change any time.
    const [color] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

    const user = useMemo(() => ({
        name: userName,
        color
    }), [userName, color]);

    // Flag the user as typing for a moment after each keystroke.
    useEffect(() => {
        if (!provider || !editorRef) return;

        let typingTimeout: NodeJS.Timeout;

        const handleContentChange = () => {
            provider.awareness.setLocalStateField('isTyping', true);

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                provider.awareness.setLocalStateField('isTyping', false);
            }, 1000);
        };

        const disposable = editorRef.onDidChangeModelContent(handleContentChange);

        return () => {
            disposable.dispose();
            clearTimeout(typingTimeout);
        };
    }, [provider, editorRef]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        setEditorRef(editor);
        setMonacoRef(monaco);
        if (onEditorMount) onEditorMount(editor, monaco);
    };

    useCursorBroadcasting(editorRef, provider, user);
    useFollowUser(editorRef, provider, followUserId);

    // Install the vim bindings when the mode turns on and remove them when it turns off.
    useEffect(() => {
        if (!editorRef || !statusNodeRef.current) return;

        if (isVimMode) {
            if (!vimModeRef.current) {
                const vim = initVimMode(editorRef, statusNodeRef.current);
                vimModeRef.current = vim;
            }
        } else {
            if (vimModeRef.current) {
                vimModeRef.current.dispose();
                vimModeRef.current = null;
            }
        }

        return () => {
            if (vimModeRef.current) {
                vimModeRef.current.dispose();
                vimModeRef.current = null;
            }
        };
    }, [isVimMode, editorRef]);

    // Update Monaco Language when prop changes
    useEffect(() => {
        if (editorRef && monacoRef && language) {
            const model = editorRef.getModel();
            if (model) {
                monacoRef.editor.setModelLanguage(model, language);
            }
        }
    }, [language, editorRef, monacoRef]);

    // Sync Language to Yjs
    useEffect(() => {
        if (!yMap || !language) return;
        if (yMap.get("language") !== language) {
            yMap.set("language", language);
        }
    }, [language, yMap]);

    // Keep the shared language and the remote cursor styling in sync.
    useEffect(() => {
        if (!provider || !doc) return;

        const configMap = doc.getMap("config");
        setYMap(configMap);

        const handleConfigChange = () => {
            const newLang = configMap.get("language");
            if (typeof newLang === "string") {
                onLanguageChange?.(newLang);
            }
        };

        configMap.observe(handleConfigChange);
        handleConfigChange();

        const updateCursorStyles = (states: Collaborator[]) => {
            const styleId = "yjs-cursor-styles";
            let styleElement = document.getElementById(styleId);
            if (!styleElement) {
                styleElement = document.createElement("style");
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            let css = "";
            states.forEach((state) => {
                if (!state.user?.color) return;

                const { color, name } = state.user;
                const clientID = state.clientID;
                css += `
                    .yRemoteSelection-${clientID} { background-color: ${color}; opacity: 0.2; }
                    .yRemoteSelectionHead-${clientID} {
                        position: absolute; border-left: ${color} solid 2px;
                        border-top: ${color} solid 2px; border-bottom: ${color} solid 2px;
                        height: 100%; box-sizing: border-box;
                    }
                    .yRemoteSelectionHead-${clientID}::after {
                        position: absolute; content: "${name}"; top: -1.8em; left: -2px;
                        font-size: 0.7rem; font-weight: bold; background-color: ${color};
                        color: #000; padding: 2px 6px; border-radius: 4px; border-bottom-left-radius: 0;
                        white-space: nowrap; pointer-events: none; z-index: 10;
                    }
                `;
            });

            styleElement.innerHTML = css;
        };

        const onAwarenessUpdate = () => {
            const states = Array.from(provider.awareness.getStates().entries())
                .map(([clientID, state]) => ({ clientID, ...(state as Omit<Collaborator, "clientID">) }));

            onAwarenessChange?.(states);
            updateCursorStyles(states);
        };

        provider.awareness.on('change', onAwarenessUpdate);
        onAwarenessUpdate();

        return () => {
            configMap.unobserve(handleConfigChange);
            provider.awareness.off('change', onAwarenessUpdate);
        };
    }, [provider, doc, onAwarenessChange, onLanguageChange]);

    // Bind the active file to its shared Y.Text.
    const bindingRef = React.useRef<MonacoBinding | null>(null);

    // The binding may only be created once the provider finished its first sync,
    // otherwise a fresh client would seed the document and wipe existing files.
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        if (!provider) return;

        if (provider.shouldConnect && provider.wsconnected && provider.synced) {
            setIsSynced(true);
        }

        const onSync = (isSynced: boolean) => {
            setIsSynced(isSynced);
        };

        provider.on('synced', onSync);
        return () => {
            provider.off('synced', onSync);
        };
    }, [provider]);

    // Bumping this forces a re-bind when the remote replaced the Y.Text instance.
    const [bindingVersion, setBindingVersion] = useState(0);

    useEffect(() => {
        if (!editorRef || !provider || !doc || !filename || !isSynced) return;

        if (bindingRef.current) {
            bindingRef.current.destroy();
            bindingRef.current = null;
        }

        const filesMap = doc.getMap("files");

        // Seed the file for the first client in the room.
        if (!filesMap.has(filename)) {
            const newFile = new Y.Text();
            newFile.insert(0, defaultValue || "");
            filesMap.set(filename, newFile);
        }

        const yText = filesMap.get(filename) as Y.Text;
        const model = editorRef.getModel();
        if (!model) return;

        const newBinding = new MonacoBinding(
            yText,
            model,
            new Set([editorRef]),
            provider.awareness
        );
        bindingRef.current = newBinding;
        editorRef.layout();

        const handleMapChange = () => {
            // A different Y.Text object means somebody replaced the file wholesale,
            // so the existing binding is stale and has to be rebuilt.
            if (filesMap.get(filename) !== yText) {
                setBindingVersion((version) => version + 1);
            }
        };

        filesMap.observe(handleMapChange);

        return () => {
            filesMap.unobserve(handleMapChange);
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        };
    }, [editorRef, provider, doc, filename, isSynced, bindingVersion, defaultValue]);

    return (
        <div className={cn("relative w-full h-full flex flex-col", className)}>
            <div className="flex-1 overflow-hidden relative">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    defaultValue={defaultValue}
                    theme="vs-dark"
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        padding: { top: 16 },
                        fontFamily: "var(--font-mono)",
                        formatOnPaste: true,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        theme: "vs-dark",
                    }}
                    className="bg-transparent"
                />
            </div>
            {/* Only visible while Vim mode is active. */}
            <div
                ref={statusNodeRef}
                className={cn(
                    "w-full bg-[#1e1e1e] border-t border-white/10 text-xs px-2 py-1 font-mono text-zinc-400 min-h-[24px]",
                    !isVimMode && "hidden"
                )}
            />

            <TypingIndicator provider={provider} />
        </div>
    );
}

function TypingIndicator({ provider }: { provider: WebsocketProvider | null }) {
    const [typingUsers, setTypingUsers] = useState<Collaborator[]>([]);

    useEffect(() => {
        if (!provider) return;

        const updateTypingStatus = () => {
            const states = Array.from(provider.awareness.getStates().values()) as Collaborator[];
            setTypingUsers(states.filter((state) => state.isTyping && state.user?.name));
        };

        provider.awareness.on('change', updateTypingStatus);
        return () => provider.awareness.off('change', updateTypingStatus);
    }, [provider]);

    if (typingUsers.length === 0) return null;

    const names = typingUsers.map((state) => state.user?.name ?? "Someone");

    return (
        <div className="absolute bottom-8 right-6 z-50 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full text-xs text-zinc-400 flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-none">
            <div className="flex -space-x-1.5">
                {typingUsers.slice(0, 3).map((state) => (
                    <div
                        key={state.clientID}
                        className="w-2 h-2 rounded-full ring-2 ring-black"
                        style={{ backgroundColor: state.user?.color || '#888' }}
                    />
                ))}
            </div>
            <span>
                {names.length === 1
                    ? `${names[0]} is typing...`
                    : names.length === 2
                        ? `${names[0]} and ${names[1]} are typing...`
                        : `${names[0]} and ${names.length - 1} others are typing...`
                }
            </span>
        </div>
    );
}
