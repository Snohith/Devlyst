"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <img src="/logo.svg" alt="Devlyst Logo" className="w-8 h-8 object-contain" />
                        Devlyst
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="hidden md:block px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-zinc-200 transition-colors"
                    >
                        Go to Dashboard
                    </Link>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col gap-4 py-6 text-sm font-medium text-zinc-400">
                            <Link
                                href="/#features"
                                className="hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="/blog"
                                className="hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Blog
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-4 py-3 text-center font-bold text-black bg-white rounded-xl hover:bg-zinc-200 transition-colors mt-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
