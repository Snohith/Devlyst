'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"
                    >
                        <AlertTriangle className="w-8 h-8" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
                    <p className="text-zinc-400 mb-8 text-sm">
                        We encountered an unexpected error. Our team has been notified.
                        <br />
                        <span className="font-mono text-zinc-600 text-xs mt-2 block">{error.digest}</span>
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <Link href="/" className="w-full flex items-center justify-center gap-2 bg-white/5 text-white font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                            <Home className="w-4 h-4" />
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
