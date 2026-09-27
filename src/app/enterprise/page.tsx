import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-6 text-center">
                <h1 className="text-5xl font-bold text-white mb-6">Devlyst Enterprise</h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                    Secure, scalable, and customizable solutions for large teams and organizations.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/contact" className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
                        Contact Sales
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
