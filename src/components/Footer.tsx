"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-black py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                {/* Logo & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <Image src="/logo.svg" alt="Devlyst Logo" width={32} height={32} className="object-contain" />
                        Devlyst
                    </div>
                    <p className="text-zinc-500 text-sm">
                        © {new Date().getFullYear()} Devlyst Inc. <br />
                        All rights reserved.
                    </p>
                </div>

                {/* Socials & Links */}
                <div className="flex items-center gap-8">
                    <div className="flex gap-6 text-sm font-medium text-zinc-400">
                        <Link href="/#features" className="hover:text-white transition-colors">Products</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="https://github.com" target="_blank" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                            <Github className="w-5 h-5" />
                        </Link>
                        <Link href="https://twitter.com" target="_blank" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                            <Twitter className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

            </div>

            <div className="max-w-6xl mx-auto mt-12 flex justify-end gap-6 text-xs text-zinc-600">
                <Link href="/privacy" className="hover:text-zinc-400">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-zinc-400">Terms of Service</Link>
            </div>
        </footer>
    );
}
