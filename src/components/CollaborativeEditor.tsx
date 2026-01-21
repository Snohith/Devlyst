"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { cn } from "@/lib/utils";
import { useCursorBroadcasting } from "@/hooks/useCursorBroadcasting";
import { useFollowUser } from "@/hooks/useFollowUser";

// Random color generator for cursors
const USER_COLORS = [
    "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6",
];

interface CollaborativeEditorProps {
    roomId: string;
    className?: string;
    defaultValue?: string;
    onEditorMount?: (editor: any, monaco: any) => void;
    onAwarenessChange?: (users: any[]) => void;
    language?: string;
    onLanguageChange?: (lang: string) => void;
    followUserId?: number | null;
    isVimMode?: boolean; // New prop
    doc: Y.Doc | null;
    provider: WebsocketProvider | null;
    filename: string;
    userName: string;
}

// Import monaco-vim dynamically or just verify it works with SSR false (Client Header is present so standard import usually OK, but require() inside effect is safer for some libs). 
// Actually standard import `import { initVimMode } from 'monaco-vim'` works if the component is client-side only.
// But `monaco-vim` might depend on `window`. Let's use `require` inside the effect or dynamic import.
import { initVimMode } from "monaco-vim";

export type MonacoEditor = Parameters<OnMount>[0];

export default function CollaborativeEditor({
    roomId,
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
    const [monacoRef, setMonacoRef] = useState<Parameters<OnMount>[1] | null>(null);
    const [yMap, setYMap] = useState<Y.Map<unknown> | null>(null);

    const vimModeRef = useRef<any>(null);
    const statusNodeRef = useRef<HTMLDivElement>(null);

    // Stable User Identity (Color persists, name updates)
    const [color] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

    const user = useMemo(() => ({
        name: userName,
        color
    }), [userName, color]);

    // Handle typing events
    useEffect(() => {
        if (!provider || !editorRef) return;

        let typingTimeout: NodeJS.Timeout;

        const handleContentChange = () => {
            // Set local state to typing
            provider.awareness.setLocalStateField('isTyping', true);

            // Clear typing status after 1s of inactivity
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

    // Use Custom Hooks
    useCursorBroadcasting(editorRef, provider, user);
    useFollowUser(editorRef, provider, followUserId);

    // Vim Mode Effect
    useEffect(() => {
        if (!editorRef || !statusNodeRef.current) return;

        if (isVimMode) {
            if (!vimModeRef.current) {
                // Attach Vim Mode
                const vim = initVimMode(editorRef, statusNodeRef.current);
                vimModeRef.current = vim;
            }
        } else {
            if (vimModeRef.current) {
                // Detach Vim Mode
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
                monacoRef.editor.setModelLanguage(model, language); // Safely update language
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

    // Setup Config Map & Awareness Listeners (Styles)
    useEffect(() => {
        if (!provider || !doc) return;

        const configMap = doc.getMap("config");
        setTimeout(() => setYMap(configMap), 0);

        const handleConfigChange = () => {
            const newLang = configMap.get("language");
            if (newLang && typeof newLang === 'string' && onLanguageChange) {
                onLanguageChange(newLang);
            }
        };

        configMap.observe(handleConfigChange);
        handleConfigChange();

        // Cursor Styling (Moved to a separate helper function to keep effect clean)
        const updateCursorStyles = (states: any[]) => {
            // ... (CSS generation logic could be moved to util, but keeping inline for now is okay if component is smaller)
            // For brevity, using the same logic but condensed or strictly necessary parts
            const styleId = "yjs-cursor-styles";
            let styleElement = document.getElementById(styleId);
            if (!styleElement) {
                styleElement = document.createElement("style");
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            let css = "";
            states.forEach(state => {
                if (state.user && state.user.color) {
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
                }
            });
            styleElement.innerHTML = css;
        };

        const onAwarenessUpdate = () => {
            const states = Array.from(provider.awareness.getStates().entries()).map(([key, value]) => ({ clientID: key, ...value }));
            if (onAwarenessChange) onAwarenessChange(Array.from(provider.awareness.getStates().values()));
            updateCursorStyles(states);
        };

        provider.awareness.on('change', onAwarenessUpdate);
        onAwarenessUpdate();

        return () => {
            configMap.unobserve(handleConfigChange);
            provider.awareness.off('change', onAwarenessUpdate);
            // Ideally reject style tag only if no other editors are present, but here it's fine
        };
    }, [provider, doc]); // Removed onLanguageChange from dep

    // File Binding Logic (Critical for Memory Leaks)
    const bindingRef = React.useRef<MonacoBinding | null>(null);

    // Wait for provider sync to avoid overwriting existing files
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        if (!provider) return;

        // Check if already synced
        if (provider.shouldConnect && provider.wsconnected && provider.synced) {
            setTimeout(() => setIsSynced(true), 0);
        }

        const onSync = (isSynced: boolean) => {
            setIsSynced(isSynced);
        };

        provider.on('synced', onSync);
        return () => {
            provider.off('synced', onSync);
        };
    }, [provider]);

    // We use a state to force re-binding if the remote yText instance changes
    const [bindingVersion, setBindingVersion] = useState(0);

    useEffect(() => {
        if (!editorRef || !provider || !doc || !filename || !isSynced) return;

        // Cleanup previous binding immediately
        if (bindingRef.current) {
            bindingRef.current.destroy();
            bindingRef.current = null;
        }

        const filesMap = doc.getMap("files");

        // 1. Ensure file exists (Atomic check-and-set pattern preferred, but Yjs handles LWW)
        if (!filesMap.has(filename)) {
            const newFile = new Y.Text();
            newFile.insert(0, defaultValue || "");
            filesMap.set(filename, newFile);
        }

        // 2. Get the current shared type
        const yText = filesMap.get(filename) as Y.Text;

        const model = editorRef.getModel();
        if (!model) return;

        // 3. Create Binding
        // @ts-ignore
        const newBinding = new MonacoBinding(
            yText,
            model,
            new Set([editorRef]),
            provider.awareness
        );
        bindingRef.current = newBinding;
        editorRef.layout();

        // 4. Critical: Listen for external replacements of this file
        const handleMapChange = () => {
            const currentYText = filesMap.get(filename) as Y.Text;
            // If the object reference changed (someone else replaced the file), we must re-bind
            if (currentYText !== yText) {

                setBindingVersion(v => v + 1);
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
            {/* Vim Status Bar (only shown when Vim is active) */}
            {/* Vim Status Bar (only shown when Vim is active) */}
            <div
                ref={statusNodeRef}
                className={cn(
                    "w-full bg-[#1e1e1e] border-t border-white/10 text-xs px-2 py-1 font-mono text-zinc-400 min-h-[24px]",
                    !isVimMode && "hidden"
                )}
            />

            {/* Typing Indicator Overlay */}
            <TypingIndicator users={[]} provider={provider} />
        </div>
    );
}

// Typing Indicator Component
function TypingIndicator({ users, provider }: { users: any[], provider: WebsocketProvider | null }) {
    const [typingUsers, setTypingUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!provider) return;

        const updateTypingStatus = () => {
            const states = Array.from(provider.awareness.getStates().values());
            const typing = states.filter((state: any) => state.isTyping && state.user?.name);
            setTypingUsers(typing);
        };

        provider.awareness.on('change', updateTypingStatus);
        return () => provider.awareness.off('change', updateTypingStatus);
    }, [provider]);

    if (typingUsers.length === 0) return null;

    return (
        <div className="absolute bottom-8 right-6 z-50 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full text-xs text-zinc-400 flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-none">
            <div className="flex -space-x-1.5">
                {typingUsers.slice(0, 3).map((state: any, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full ring-2 ring-black"
                        style={{ backgroundColor: state.user?.color || '#888' }}
                    />
                ))}
            </div>
            <span>
                {typingUsers.length === 1
                    ? `${typingUsers[0].user.name} is typing...`
                    : typingUsers.length === 2
                        ? `${typingUsers[0].user.name} and ${typingUsers[1].user.name} are typing...`
                        : `${typingUsers[0].user.name} and ${typingUsers.length - 1} others are typing...`
                }
            </span>
        </div>
    );
}
