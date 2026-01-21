"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Hash, Settings } from "lucide-react";
import UserSettings from "@/components/UserSettings";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
    const router = useRouter();
    const [joinRoomId, setJoinRoomId] = useState("");
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [userName, setUserName] = useState("Anonymous");
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (typeof window !== "undefined") {
            // If Clerk is available and loaded, use that name, otherwise fallback to local
            if (isLoaded && user) {
                setUserName(user.fullName || user.firstName || "Anonymous");
            } else {
                const stored = localStorage.getItem("devlyst-username");
                if (stored) setUserName(stored);
            }
        }
    }, [isLoaded, user]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const id = joinRoomId.trim();
        // Allow ONLY 5 digit numbers
        if (id.length === 5 && !isNaN(Number(id))) {
            router.push(`/room/${id}`);
        } else {
            // Optional: visual feedback could be added here, but for now we rely on HTML5 validation
            // or simply existing behavior
        }
    };

    // Helper to generate 5 digit room ID
    const generateRoomId = () => Math.floor(10000 + Math.random() * 90000).toString();

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-500/30">
            {/* Header */}
            <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="Devlyst" width={32} height={32} />
                        <span className="font-bold text-lg tracking-tight">Devlyst</span>
                    </Link>

                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>
            </header>

            <main id="main-content" className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                        <p className="text-zinc-400">Welcome back, <span className="text-white font-medium">{userName}</span></p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Create Room Card */}
                    <div className="p-8 border border-white/10 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors group">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-violet-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Create New Room</h2>
                        <p className="text-zinc-400 mb-6 text-sm">Start a fresh collaboration session instantly.</p>
                        <button
                            onClick={() => router.push(`/room/${generateRoomId()}`)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors w-full sm:w-auto cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Create Room
                        </button>
                    </div>

                    {/* Join Room Card */}
                    <div className="p-8 border border-white/10 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Hash className="w-6 h-6 text-pink-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Join Existing Room</h2>
                        <p className="text-zinc-400 mb-6 text-sm">Enter a 5-digit Room ID to jump into a session.</p>

                        <form onSubmit={handleJoin} className="flex gap-2">
                            <input
                                type="text"
                                maxLength={5}
                                pattern="\d{5}"
                                placeholder="Enter 5-digit ID..."
                                value={joinRoomId}
                                onChange={(e) => {
                                    // Only allow numbers
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 5) setJoinRoomId(val);
                                }}
                                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600 font-mono"
                            />
                            <button
                                type="submit"
                                disabled={!joinRoomId.trim()}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <UserSettings
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
                currentName={userName}
                onSave={(newName) => {
                    setUserName(newName);
                    localStorage.setItem("devlyst-username", newName);
                }}
            />
        </div>
    );
}
