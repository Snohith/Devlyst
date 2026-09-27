import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8 text-center">Contact Us</h1>
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-violet-500" placeholder="Your Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-violet-500" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                            <textarea rows={4} className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-violet-500" placeholder="How can we help?" />
                        </div>
                        <button type="submit" className="w-full py-3 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
