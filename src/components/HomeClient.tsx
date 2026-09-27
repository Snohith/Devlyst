"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Features } from "./Features";

export default function HomeClient() {
    return (
        <div className="min-h-screen bg-black flex flex-col overflow-x-hidden">
            <Navbar />
            <main>
                <Hero />
                <div id="features">
                    <Features />
                </div>
            </main>
            <Footer />
        </div>
    );
}
