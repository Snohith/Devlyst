"use client";

import React from "react";
import { Spotlight } from "./ui/Spotlight";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

export function Hero() {
    const router = useRouter();
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = event;
        const { left, top } = currentTarget.getBoundingClientRect();
        setMousePosition({
            x: clientX - left,
            y: clientY - top,
        });
    };

    return (
        <div
            className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden group"
            onMouseMove={handleMouseMove}
        >
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />

            {/* Mouse-tracking Grid Overlay */}
            <div
                className="pointer-events-none absolute inset-0 transition duration-300 opacity-0 group-hover:opacity-100"
                style={{
                    maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
                    WebkitMaskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
                }}
            >
                <div className="absolute inset-0 bg-grid-white/[0.2]" />
            </div>

            <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
                <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                    Master the Art of <br /> Collaborative Coding.
                </h1>
                <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
                    Devlyst is a real-time collaborative code editor built for speed and precision.
                    Experience fluid sync, powerful tools, and a workspace that feels like magic.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    {!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all flex items-center gap-2 group/btn active:scale-95"
                        >
                            Get Started (Dev)
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <>
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button
                                        className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all flex items-center gap-2 group/btn active:scale-95"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    Open Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </SignedIn>
                        </>
                    )}

                    <button
                        onClick={() => {
                            const element = document.getElementById("features");
                            element?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-8 py-3 rounded-full border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-all"
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
}
