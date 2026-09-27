"use client";

import { useState } from "react";
import { Play, Terminal, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionPanelProps {
    onRun: () => Promise<void>;
    isRunning: boolean;
    output: string | null;
    error: string | null;
    /** Judge0 status line, e.g. "Accepted • exit 0 • 0.04s" */
    meta?: string | null;
}

export default function ExecutionPanel({ onRun, isRunning, output, error, meta }: ExecutionPanelProps) {
    const [isOpen, setIsOpen] = useState(true);
    const hasResult = Boolean(output) || Boolean(error);

    return (
        <div className={cn("border-t border-white/10 bg-black/40 backdrop-blur-sm flex flex-col transition-all duration-300 ease-in-out z-20", {
            "h-48": isOpen,
            "h-10": !isOpen
        })}>
            <div className="flex items-center justify-between px-4 h-10 bg-white/5 border-b border-white/5 select-none">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <Terminal className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Console / Output</span>
                    {meta && (
                        <span className="text-[11px] font-mono text-muted-foreground/70">{meta}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onRun}
                        disabled={isRunning}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 text-white rounded text-xs font-semibold disabled:opacity-50 transition-all",
                            isRunning ? "bg-zinc-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                        )}
                    >
                        {isRunning ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                            <Play className="w-3 h-3 fill-current" />
                        )}
                        {isRunning ? "Running..." : "Run Code"}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="flex-1 p-4 font-mono text-sm overflow-auto bg-[#0d0d0d] space-y-2">
                    {hasResult ? (
                        <>
                            {output && <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>}
                            {error && (
                                <div className="text-red-400 flex items-start gap-2">
                                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <pre className="whitespace-pre-wrap font-inherit">{error}</pre>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-muted-foreground italic">
                            Ready to execute. Click &quot;Run Code&quot; to start.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
