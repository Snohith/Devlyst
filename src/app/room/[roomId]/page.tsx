"use client";

import { useState, useRef, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Copy, Check, Users, Menu } from "lucide-react";
import ExecutionPanel from "@/components/ExecutionPanel";

import UserList from "@/components/UserList";
import { LanguageSelector } from "@/components/LanguageSelector";
import FileExplorer from "@/components/FileExplorer";
import { cn } from "@/lib/utils";
import { useCollaboration } from "@/hooks/useCollaboration";

// Dynamically import CollaborativeEditor to avoid 'window is not defined' in y-monaco
const CollaborativeEditor = dynamic(() => import("@/components/CollaborativeEditor"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse font-mono text-xs">Initializing Editor...</div>
});

interface RoomPageProps {
    params: Promise<{
        roomId: string;
    }>;
}

export default function RoomPage({ params }: RoomPageProps) {
    const { roomId } = use(params);
    const router = useRouter();

    // Yjs State
    const { doc, provider, status } = useCollaboration(roomId);

    const editorInstanceRef = useRef<any>(null);
    const monacoInstanceRef = useRef<any>(null);

    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);
    const [language, setLanguage] = useState("javascript");
    const [currentFile, setCurrentFile] = useState("main.js");

    // Identity
    const [userName, setUserName] = useState("Anonymous");

    // Feature States
    const [followUserId, setFollowUserId] = useState<number | null>(null);

    const [showFileExplorer, setShowFileExplorer] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("devlyst-username");
            if (stored) setUserName(stored);
        }
    }, []);

    const handleEditorMount = (editor: any, monaco: any) => {
        editorInstanceRef.current = editor;
        monacoInstanceRef.current = monaco;
    };

    const runCode = async () => {
        if (!editorInstanceRef.current) return;

        setIsRunning(true);
        setOutput(null);
        setError(null);

        const code = editorInstanceRef.current.getValue();

        try {
            const response = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setOutput(data.output);
            }
        } catch (err) {
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
        if (followUserId === clientId) {
            setFollowUserId(null); // Toggle off
        } else {
            setFollowUserId(clientId);
        }
    };

    // Helper for status indicator
    const getStatusIndicator = () => {
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

    // Language to Extension functionality
    const getExtensionForLanguage = (lang: string) => {
        const map: { [key: string]: string } = {
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
            css: "css"
        };
        return map[lang] || "txt";
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        // Rename current file to match new extension
        const currentName = currentFile.split('.')[0];
        const newExt = getExtensionForLanguage(newLang);
        const newFilename = `${currentName}.${newExt}`;
        setCurrentFile(newFilename);
    };

    // Auto-detect language from file extension
    useEffect(() => {
        const ext = currentFile.split('.').pop();
        const map: { [key: string]: string } = {
            js: "javascript",
            ts: "typescript",
            py: "python",
            java: "java",
            cpp: "cpp",
            cs: "csharp",
            go: "go",
            rs: "rust",
            php: "php",
            rb: "ruby",
            sql: "sql",
            html: "html",
            css: "css"
        };
        if (ext && map[ext] && map[ext] !== language) {
            setLanguage(map[ext]);
        }
    }, [currentFile]);

    return (
        <main className="h-screen w-full flex flex-col bg-zinc-950 text-foreground overflow-hidden font-sans">
            <header className="h-14 border-b border-white/10 flex items-center px-4 justify-between bg-zinc-900/50 backdrop-blur-xl z-10 supports-[backdrop-filter]:bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Devlyst" className="w-8 h-8 object-contain" />
                        <h1 className="font-semibold tracking-tight text-white/90 hidden sm:block">Devlyst</h1>
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-colors ml-2",
                            getStatusIndicator()
                        )} title={`Status: ${status}`} />
                    </div>

                    <div
                        onClick={copyRoomLink}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 rounded-md cursor-pointer transition-all hover:border-white/20 ml-4 group active:scale-95 duration-75"
                    >
                        <span className="text-xs text-zinc-400 font-mono">ID: <span className="text-zinc-200 group-hover:text-white transition-colors">{roomId}</span></span>
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />}
                    </div>
                </div>

                <div className="flex items-center gap-4">
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

                    {/* User profile removed as auth is gone. Could add a guest avatar or just nothing. */}
                </div>
            </header>

            {/* Main Content Area - Suspended Glass Container */}
            <div className="flex-1 p-4 overflow-hidden relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-black -z-20" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-500/20 blur-[120px] rounded-full -z-10 opacity-50 pointer-events-none" />

                {/* Floating Glass Editor */}
                <div className="h-full w-full flex rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                    {/* File Explorer */}
                    <FileExplorer
                        doc={doc}
                        provider={provider}
                        currentFile={currentFile}
                        onFileSelect={setCurrentFile}
                        isOpen={showFileExplorer}
                        onClose={() => setShowFileExplorer(false)}
                    />

                    {/* Editor Area */}
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

                            <div className="flex items-center gap-2">
                                {/* Settings moved to Dashboard */}
                            </div>
                        </header>

                        <div className="flex-1 flex flex-row overflow-hidden relative">
                            <div className="flex-1 relative h-full">
                                {doc && provider && (
                                    <CollaborativeEditor
                                        roomId={roomId}
                                        onEditorMount={handleEditorMount}
                                        onAwarenessChange={setUsers}
                                        language={language}
                                        onLanguageChange={setLanguage}
                                        followUserId={followUserId}
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
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

