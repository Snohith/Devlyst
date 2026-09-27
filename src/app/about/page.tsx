import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-white mb-8">About Devlyst</h1>
                    <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                        Devlyst was born from a simple idea: coding shouldn&apos;t be a solitary activity.
                        We believe that the best software is built together, in real-time, without friction.
                    </p>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Our mission is to empower developers with tools that feel like magic,
                        enabling seamless collaboration across the globe.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
