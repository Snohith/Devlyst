"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "sql", label: "SQL" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
];

interface LanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-[140px] px-3 py-1.5 text-sm bg-zinc-800 border border-white/10 rounded-md text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/20"
            >
                {languages.find((framework) => framework.value === value)?.label || "Select language"}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 z-20 mt-1 w-[140px] max-h-60 overflow-y-auto rounded-md bg-zinc-900 border border-white/10 shadow-lg py-1">
                        {languages.map((language) => (
                            <div
                                key={language.value}
                                className={cn(
                                    "flex items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-white/10 transition-colors",
                                    value === language.value ? "text-white" : "text-zinc-400"
                                )}
                                onClick={() => {
                                    onChange(language.value);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-3 w-3",
                                        value === language.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {language.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
