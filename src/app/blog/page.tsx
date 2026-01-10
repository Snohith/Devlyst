import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function BlogPage() {
    const posts = [
        {
            title: "The Future of Collaborative Coding",
            date: "January 15, 2026",
            excerpt: "Real-time collaboration is changing how teams build software. Discover how CRDTs and edge computing are making latency a thing of the past."
        },
        {
            title: "Scaling WebSocket Architectures",
            date: "January 12, 2026",
            excerpt: "Handling thousands of concurrent connections requires a robust architecture. Learn about our journey scaling Devlyst's real-time engine."
        },
        {
            title: "Why We Switched to Rust for Core Services",
            date: "January 8, 2026",
            excerpt: "Performance matters. We dive deep into why migrating our matching engine to Rust improved throughput by 300%."
        }
    ];

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-zinc-300">
                    <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
                    <div className="grid gap-8">
                        {posts.map((post, i) => (
                            <div key={i} className="p-6 border border-white/5 rounded-xl bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors cursor-pointer group">
                                <div className="text-sm text-zinc-500 mb-2">{post.date}</div>
                                <h2 className="text-2xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">{post.title}</h2>
                                <p className="text-zinc-400">{post.excerpt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
