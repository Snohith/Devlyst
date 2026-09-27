"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const MovingBorderInput = ({
    className,
    value,
    onChange,
    placeholder,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <div className="relative p-[1px] overflow-hidden rounded-md group w-full">
            <div className="absolute inset-0 h-full w-full animate-rotate-border bg-[conic-gradient(transparent_20deg,var(--primary)_120deg,transparent_180deg)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    "relative flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 z-10",
                    className
                )}
                {...props}
            />
        </div>
    );
};
