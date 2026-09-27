"use client";

import { useState, useRef, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowLeft, Copy, Check, Menu, Wand2, Keyboard } from "lucide-react";
import { AuthIdentitySync } from "@/components/AuthIdentitySync";

import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";
import type { Collaborator, MonacoApi, MonacoEditor } from "@/lib/collaboration";
import { useCollaboration } from "@/hooks/useCollaboration";
import { formatCode } from "@/lib/formatter";

const LANGUAGE_EXTENSIONS: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    php: "php",
    ruby: "rb",
    sql: "sql",
    html: "html",
    css: "css",
};

const EXTENSION_LANGUAGES = Object.fromEntries(
    Object.entries(LANGUAGE_EXTENSIONS).map(([languageName, extension]) => [extension, languageName])
);

// Monaco bundles are large, so the editor and the panels load on demand.
const CollaborativeEditor = dynamic(() => import("@/components/CollaborativeEditor"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse font-mono text-xs">Initializing Editor...</div>
});

const ExecutionPanel = dynamic(() => import("@/components/ExecutionPanel"), {
    ssr: false,
    loading: () => <div className="text-xs text-zinc-500 p-2">Loading execution panel...</div>
});

const FileExplorer = dynamic(() => import("@/components/FileExplorer"), {
    ssr: false
});

const UserList = dynamic(() => import("@/components/UserList"), {
    ssr: false
});

interface RoomPageProps {
    params: Promise<{
        roomId: string;
    }>;
}

/** Builds the short status line shown in the execution panel header. */
function buildRunMeta(data: { status?: unknown; exitCode?: unknown; timeMs?: unknown }): string | null {
    const parts: string[] = [];

    if (typeof data.status === "string") parts.push(data.status);
    if (typeof data.exitCode === "number") parts.push(`exit ${data.exitCode}`);
    if (typeof data.timeMs === "number") parts.push(`${(data.timeMs / 1000).toFixed(2)}s`);

    return parts.length > 0 ? parts.join(" \u2022 ") : null;
}

export default function RoomPage({ params }: RoomPageProps) {
    const { roomId } = use(params);
    const router = useRouter();

    const { doc, provider, status } = useCollaboration(roomId);

    const editorInstanceRef = useRef<MonacoEditor | null>(null);
    const monacoInstanceRef = useRef<MonacoApi | null>(null);

    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [runMeta, setRunMeta] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [isVimMode, setIsVimMode] = useState(false);
    const [users, setUsers] = useState<Collaborator[]>([]);
    const [copied, setCopied] = useState(false);
    const [language, setLanguage] = useState("javascript");
    const [currentFile, setCurrentFile] = useState("main.js");
    const [userName, setUserName] = useState("Anonymous");
    const [followUserId, setFollowUserId] = useState<number | null>(null);
    const [showFileExplorer, setShowFileExplorer] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem("devlyst-username");
        if (stored) setUserName(stored);
    }, []);

    const handleEditorMount = (editor: MonacoEditor, monaco: MonacoApi) => {
        editorInstanceRef.current = editor;
        monacoInstanceRef.current = monaco;

        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
            handleFormat();
        });
    };

    const handleFormat = async () => {
        const editor = editorInstanceRef.current;
        if (!editor) return;

        setIsFormatting(true);
        try {
            const currentCode = editor.getValue();
            const formatted = await formatCode(currentCode, language);
            if (formatted === currentCode) return;

            // Replacing the whole document is the simplest approach that keeps the
            // formatter independent of a diff library; Yjs treats it as one edit.
            editor.pushUndoStop();
            editor.executeEdits("prettier", [{
                range: editor.getModel()!.getFullModelRange(),
                text: formatted,
                forceMoveMarkers: true
            }]);
            editor.pushUndoStop();
        } catch (err) {
            console.error("Formatting failed", err);
        } finally {
            setIsFormatting(false);
        }
    };

    const runCode = async () => {
        if (!editorInstanceRef.current) return;

        setIsRunning(true);
        setOutput(null);
        setError(null);
        setRunMeta(null);

        const code = editorInstanceRef.current.getValue();

        try {
            const response = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language }),
            });

            const data = await response.json().catch(() => null);

            if (!data) {
                setError(`Execution failed (HTTP ${response.status}).`);
                return;
            }

            setOutput(typeof data.output === "string" && data.output.length > 0 ? data.output : null);
            setError(typeof data.error === "string" && data.error.length > 0 ? data.error : null);
            setRunMeta(buildRunMeta(data));
        } catch (err) {
            console.error("Execution request failed", err);
            setError("Failed to execute code. Check connection.");
        } finally {
            setIsRunning(false);
        }
    };

    const copyRoomLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFollowUser = (clientId: number) => {
        setFollowUserId((current) => (current === clientId ? null : clientId));
    };

    const statusColor = () => {
        switch (status) {
            case "connected":
                return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
            case "connecting":
                return "bg-yellow-500 animate-pulse";
            case "error":
                return "bg-red-500";
            default:
                return "bg-zinc-500";
        }
    };

    // Renaming the file keeps the language selector and the toolbar in agreement.
    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        const baseName = currentFile.split(".")[0];
        setCurrentFile(`${baseName}.${LANGUAGE_EXTENSIONS[newLang] ?? "txt"}`);
    };

    // Opening a file with a known extension switches the editor language too.
    useEffect(() => {
        const extension = currentFile.split(".").pop()?.toLowerCase();
        const detected = extension ? EXTENSION_LANGUAGES[extension] : undefined;

        if (detected && detected !== language) {
            setLanguage(detected);
        }
    }, [currentFile, language]);

    return (
        <main id="main-content" className="h-screen w-full flex flex-col bg-zinc-950 text-foreground overflow-hidden font-sans">
            {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
                <AuthIdentitySync onUserSync={setUserName} />
            )}
            <header className="h-14 border-b border-white/10 flex items-center px-4 justify-between bg-zinc-900/50 backdrop-blur-xl z-10 supports-[backdrop-filter]:bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                        title="Back to Dashboard"
                        aria-label="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <div className="h-6 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="Devlyst" width={32} height={32} className="object-contain" />
                        <h1 className="font-semibold tracking-tight text-white/90 hidden sm:block">Devlyst</h1>
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-colors ml-2",
                            statusColor()
                        )} title={`Status: ${status}`} />
                    </div>

                    <button
                        onClick={copyRoomLink}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 rounded-md cursor-pointer transition-all hover:border-white/20 ml-4 group active:scale-95 duration-75"
                        aria-label={copied ? "Room link copied" : "Copy room link"}
                        title={copied ? "Room link copied" : "Copy room link"}
                    >
                        <span className="text-xs text-zinc-400 font-mono">ID: <span className="text-zinc-200 group-hover:text-white transition-colors">{roomId}</span></span>
                        {copied ? <Check className="w-3 h-3 text-green-500" aria-hidden="true" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" aria-hidden="true" />}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsVimMode(!isVimMode)}
                        className={cn(
                            "p-2 hover:bg-white/10 rounded-md transition-colors",
                            isVimMode ? "text-green-400 bg-white/5" : "text-zinc-400 hover:text-white"
                        )}
                        title={isVimMode ? "Disable Vim Mode" : "Enable Vim Mode"}
                        aria-label={isVimMode ? "Disable Vim Mode" : "Enable Vim Mode"}
                        aria-pressed={isVimMode}
                    >
                        <Keyboard className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <button
                        onClick={handleFormat}
                        disabled={isFormatting}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
                        title="Format Code (Shift+Alt+F)"
                        aria-label="Format code (Shift+Alt+F)"
                        aria-busy={isFormatting}
                    >
                        <Wand2 className={cn("w-5 h-5", isFormatting && "animate-pulse text-violet-400")} aria-hidden="true" />
                    </button>

                    <LanguageSelector value={language} onChange={handleLanguageChange} />

                    <UserList
                        users={users}
                        onFollow={handleFollowUser}
                        followedUserId={followUserId}
                    />

                    <button
                        onClick={copyRoomLink}
                        className={cn(
                            "text-xs font-medium transition-all border rounded-full px-4 py-1.5 hidden sm:block",
                            copied
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "text-zinc-400 hover:text-white border-white/10 hover:bg-white/5 bg-zinc-900"
                        )}
                    >
                        {copied ? "Link Copied!" : "Share Room"}
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-black -z-20" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-500/20 blur-[120px] rounded-full -z-10 opacity-50 pointer-events-none" />

                <div className="h-full w-full flex rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                    <FileExplorer
                        doc={doc}
                        currentFile={currentFile}
                        onFileSelect={setCurrentFile}
                        isOpen={showFileExplorer}
                        onClose={() => setShowFileExplorer(false)}
                    />

                    <div className="flex-1 flex flex-col relative w-full bg-transparent">
                        <header className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowFileExplorer(true)}
                                    className="md:hidden text-zinc-400 hover:text-white"
                                >
                                    <Menu className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-medium text-zinc-400 font-mono flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", isRunning ? "bg-yellow-500 animate-pulse" : "bg-green-500")} />
                                    {currentFile}
                                </span>
                            </div>
                        </header>

                        <div className="flex-1 flex flex-row overflow-hidden relative">
                            <div className="flex-1 relative h-full">
                                {doc && provider && (
                                    <CollaborativeEditor
                                        onEditorMount={handleEditorMount}
                                        onAwarenessChange={setUsers}
                                        language={language}
                                        onLanguageChange={setLanguage}
                                        followUserId={followUserId}
                                        isVimMode={isVimMode}
                                        doc={doc}
                                        provider={provider}
                                        filename={currentFile}
                                        userName={userName}
                                    />
                                )}
                            </div>


                        </div>

                        <ExecutionPanel
                            onRun={runCode}
                            isRunning={isRunning}
                            output={output}
                            error={error}
                            meta={runMeta}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

