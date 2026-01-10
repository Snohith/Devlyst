"use client";

import { useState, useEffect } from "react";
import * as Y from "yjs";
import { FilePlus, File, Trash2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
    doc: Y.Doc | null;
    provider: any;
    currentFile: string;
    onFileSelect: (filename: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function FileExplorer({ doc, provider, currentFile, onFileSelect, isOpen, onClose }: FileExplorerProps) {
    const [files, setFiles] = useState<string[]>([]);
    const [newFileName, setNewFileName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);

    useEffect(() => {
        if (!doc) return;
        const filesMap = doc.getMap("files");

        const updateFiles = () => {
            setFiles(Array.from(filesMap.keys()).sort());
        };

        filesMap.observe(updateFiles);
        updateFiles(); // Initial

        // Ensure main.js exists
        if (!filesMap.has("main.js")) {
            const text = new Y.Text();
            text.insert(0, "// Welcome to Devlyst!\n// Start coding collaboratively...\n\nconsole.log('Hello World');");
            filesMap.set("main.js", text);
        }

        return () => filesMap.unobserve(updateFiles);
    }, [doc]);

    const handleCreateFile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFileName.trim() || !doc) return;

        const filesMap = doc.getMap("files");
        const name = newFileName.trim();
        if (!filesMap.has(name)) {
            filesMap.set(name, new Y.Text());
            onFileSelect(name);
            onClose?.(); // Close on selection if mobile
        }
        setIsCreating(false);
        setNewFileName("");
    };

    const handleDeleteClick = (e: React.MouseEvent, fileName: string) => {
        e.stopPropagation();
        if (files.length <= 1) {
            alert("Cannot delete the last file.");
            return;
        }
        setDeletingFile(fileName);
    };

    const confirmDelete = (e: React.MouseEvent, fileName: string) => {
        e.stopPropagation();
        if (!doc) return;

        const filesMap = doc.getMap("files");
        filesMap.delete(fileName);

        if (currentFile === fileName) {
            const remaining = Array.from(filesMap.keys()).sort();
            if (remaining.length > 0) {
                onFileSelect(remaining[0]);
            }
        }
        setDeletingFile(null);
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingFile(null);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-64 border-r border-white/10 bg-zinc-900/95 md:bg-zinc-900/30 flex flex-col backdrop-blur-xl md:backdrop-blur-none",
                "fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/5">
                    <span>Explorer ({files.length})</span>
                    <button onClick={() => setIsCreating(true)} className="hover:text-white transition-colors">
                        <FilePlus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {files.map(file => (
                        <div
                            key={file}
                            onClick={() => {
                                onFileSelect(file);
                                onClose?.();
                            }}
                            className={cn(
                                "px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between group transition-colors",
                                currentFile === file ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <File className="w-4 h-4 opacity-50 flex-shrink-0" />
                                <span className="truncate">{file}</span>
                            </div>

                            {deletingFile === file ? (
                                <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                    <button
                                        onClick={(e) => confirmDelete(e, file)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                        title="Confirm Delete"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={cancelDelete}
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                        title="Cancel"
                                    >
                                        <XCircle className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleDeleteClick(e, file)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                                    title="Delete file"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    {isCreating && (
                        <form onSubmit={handleCreateFile} className="px-2">
                            <input
                                autoFocus
                                type="text"
                                value={newFileName}
                                onChange={e => setNewFileName(e.target.value)}
                                onBlur={() => setIsCreating(false)}
                                placeholder="filename.js..."
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500"
                            />
                        </form>
                    )}
                </div>
            </aside>
        </>
    );
}
