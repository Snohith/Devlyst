"use client";

import { Moon, Sun, Monitor, PaintBucket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ThemeSelectorProps {
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

const THEMES = [
    { id: "vs-dark", name: "VS Dark", icon: Moon },
    { id: "light", name: "Light", icon: Sun },
    { id: "hc-black", name: "High Contrast", icon: Monitor },
];

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                title="Change Theme"
            >
                <PaintBucket className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                        <div className="p-2 space-y-1">
                            {THEMES.map((theme) => {
                                const Icon = theme.icon;
                                const isActive = currentTheme === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => {
                                            onThemeChange(theme.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                                            isActive
                                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/20"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{theme.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
