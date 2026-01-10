"use client";

import { useState, useEffect } from "react";
import { User, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onSave: (newName: string) => void;
}

export default function UserSettings({ isOpen, onClose, currentName, onSave }: UserSettingsProps) {
    const [name, setName] = useState(currentName);

    useEffect(() => {
        setName(currentName);
    }, [currentName, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-violet-500/10 rounded-full">
                        <User className="w-6 h-6 text-violet-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Your Identity</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full h-11 px-4 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 text-white placeholder:text-zinc-600 transition-all font-mono text-sm"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                            This name will be visible to other collaborators in the room.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
