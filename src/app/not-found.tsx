import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black" />
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="max-w-lg w-full relative z-10 flex flex-col items-center text-center">

                <div className="w-24 h-24 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-2xl rotate-3 transform hover:rotate-6 transition-transform duration-500">
                    <FileQuestion className="w-10 h-10 text-violet-400" />
                </div>

                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-4 tracking-tight">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-3">Page Not Found</h2>
                <p className="text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    The code you are looking for might have been compiled away or never existed in this dimension.
                </p>

                <Link
                    href="/"
                    className="group flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Base
                </Link>
            </div>
        </div>
    );
}
