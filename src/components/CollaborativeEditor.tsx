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
    doc: Y.Doc | null;
    provider: WebsocketProvider | null;
    filename: string;
    userName: string;
}

export default function CollaborativeEditor({
    roomId,
    className,
    defaultValue = "// Start coding together...",
    onEditorMount,
    onAwarenessChange,
    onLanguageChange,
    language = "javascript",
    followUserId = null,
    doc,
    provider,
    filename,
    userName
}: CollaborativeEditorProps) {
    const [editorRef, setEditorRef] = useState<any>(null);
    const [monacoRef, setMonacoRef] = useState<any>(null);
    const [yMap, setYMap] = useState<Y.Map<any> | null>(null);

    // Stable User Identity (Color persists, name updates)
    // We use a ref for color so it doesn't change when name changes
    const userColor = useRef(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

    const user = useMemo(() => ({
        name: userName,
        color: userColor.current
    }), [userName]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        setEditorRef(editor);
        setMonacoRef(monaco);
        if (onEditorMount) onEditorMount(editor, monaco);
    };

    // Use Custom Hooks
    useCursorBroadcasting(editorRef, provider, user);
    useFollowUser(editorRef, provider, followUserId);

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
        setYMap(configMap);

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

        // 3. Create Binding
        // @ts-ignore
        const newBinding = new MonacoBinding(
            yText,
            editorRef.getModel(),
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
                console.log("[Devlyst] File replaced remotely, re-binding...");
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
        </div>
    );
}
