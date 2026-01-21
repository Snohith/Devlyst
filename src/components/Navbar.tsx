"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Standard mounted check pattern
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <Image src="/logo.svg" alt="Devlyst Logo" width={32} height={32} className="object-contain" priority />
                        Devlyst
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!mounted ? (
                        // Placeholder during SSR to prevent hydration mismatch
                        <div className="hidden md:block px-6 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full opacity-50">
                            Loading...
                        </div>
                    ) : !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
                        <Link href="/sign-in" className="hidden md:block px-6 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95">
                            Sign In (Dev)
                        </Link>
                    ) : (
                        <>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="hidden md:block px-6 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    href="/dashboard"
                                    className="hidden md:block px-6 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    Dashboard
                                </Link>
                                <div className="ml-2 flex items-center">
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: "w-9 h-9 border border-white/10"
                                            }
                                        }}
                                    />
                                </div>
                            </SignedIn>
                        </>
                    )}

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
                            {mounted && (
                                !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
                                    <Link
                                        href="/sign-in"
                                        className="px-4 py-3 text-center font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors mt-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign In (Dev)
                                    </Link>
                                ) : (
                                    <>
                                        <SignedOut>
                                            <SignInButton mode="modal">
                                                <button
                                                    className="px-4 py-3 text-center font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors mt-2"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Sign In
                                                </button>
                                            </SignInButton>
                                        </SignedOut>
                                        <SignedIn>
                                            <Link
                                                href="/dashboard"
                                                className="px-4 py-3 text-center font-bold text-black bg-white rounded-xl hover:bg-zinc-200 transition-colors mt-2"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                        </SignedIn>
                                    </>
                                )
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
