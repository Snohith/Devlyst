import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import {
    IconArrowWaveRightUp,
    IconBoxAlignRightFilled,
    IconBoxAlignTopLeft,
    IconClipboardCopy,
    IconFileBroken,
    IconSignature,
    IconTableColumn,
} from "@tabler/icons-react";
import { Code2, Users, Zap, Lock, Globe, Terminal } from "lucide-react";

export function Features() {
    return (
        <BentoGrid className="max-w-4xl mx-auto pb-20 px-4" >
            {items.map((item, i) => (
                <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    icon={item.icon}
                    className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                />
            ))}
        </BentoGrid>
    );
}
const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />
);

const CollaborationHeader = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center group">
        <div className="absolute inset-0 bg-dot-white/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative flex items-center -space-x-4 mb-3">
            {/* Avatars with ring and hover effect */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-4 border-[#121212] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-pink-500/20 z-30 group-hover:-translate-y-2 transition-transform duration-300">A</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-[#121212] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20 z-20 group-hover:-translate-y-2 transition-transform duration-300 delay-75">B</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-4 border-[#121212] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-500/20 z-10 group-hover:-translate-y-2 transition-transform duration-300 delay-150">C</div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-zinc-300">Live Updates</span>
        </div>
    </div>
);

const EditorHeader = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#0d1117] border border-white/5 p-5 relative overflow-hidden font-mono text-[10px] leading-relaxed shadow-2xl">
        <div className="flex gap-2 mb-4 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="space-y-0.5 text-zinc-400 relative z-10">
            <p><span className="text-zinc-600 select-none mr-3">1</span><span className="text-pink-400">export</span> <span className="text-blue-400">default</span> <span className="text-violet-400">function</span> <span className="text-yellow-200">App</span>() {'{'}</p>
            <p className="pl-0"><span className="text-zinc-600 select-none mr-3">2</span>  <span className="text-pink-400">return</span> (</p>
            <p className="pl-0"><span className="text-zinc-600 select-none mr-3">3</span>    <span className="text-green-400">{'<Devlyst />'}</span></p>
            <p className="pl-0"><span className="text-zinc-600 select-none mr-3">4</span>  );</p>
            <p><span className="text-zinc-600 select-none mr-3">5</span>{'}'}</p>
            <div className="w-2 h-4 bg-blue-500/50 absolute top-[4.5em] left-[1.5em] animate-pulse" />
        </div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-600/10 rounded-full blur-[50px] pointer-events-none" />
    </div>
);

const SecurityHeader = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-neutral-900 border border-white/5 relative overflow-hidden flex items-center justify-center group isolate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

        {/* Animated Rings */}
        <div className="absolute inset-0 border border-emerald-500/10 rounded-xl group-hover:scale-95 transition-transform duration-700" />
        <div className="absolute inset-2 border border-emerald-500/5 rounded-lg group-hover:scale-95 transition-transform duration-700 delay-75" />

        <Lock className="w-14 h-14 text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] group-hover:scale-110 transition-transform duration-500" />

        {/* Scanning beam */}
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent -translate-y-full group-hover:animate-scan" />

        <div className="absolute bottom-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
            AES-256 Encrypted
        </div>
    </div>
);

const SpeedHeader = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-neutral-950 border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]" />

        <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-16 h-16 text-amber-400 fill-amber-400/20 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] z-10 group-hover:scale-110 transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)" />
        </div>

        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent -translate-y-[20px] blur-[1px]" />
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent translate-y-[20px] blur-[1px]" />
        </div>
    </div>
);

const NetworkHeader = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#050505] border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* World Map Background (simulated with dots or svg) */}
        <div className="absolute inset-0 bg-[url('/globe.svg')] bg-cover opacity-10" />

        {/* Central Hub */}
        <div className="relative z-10">
            <Globe className="w-16 h-16 text-indigo-400/80 animate-pulse-slow" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
        </div>

        {/* Connection Points */}
        <div className="absolute w-2 h-2 bg-indigo-400 rounded-full top-1/3 left-1/4 animate-ping" />
        <div className="absolute w-1.5 h-1.5 bg-violet-400 rounded-full bottom-1/3 right-1/4 animate-ping delay-500" />
        <div className="absolute w-2 h-2 bg-blue-400 rounded-full top-1/2 right-1/3 animate-ping delay-1000" />

        {/* Connecting Lines (simulated) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <path d="M100 50 Q 150 20 200 60" fill="none" stroke="url(#gradient)" strokeWidth="2" />
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const items = [
    {
        title: "Real-time Collaboration",
        description: "Edit code together with zero latency. See value instantly.",
        header: <CollaborationHeader />,
        icon: <Users className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Code Editor",
        description: "The power of VS Code in your browser. Syntax highlighting & more.",
        header: <EditorHeader />,
        icon: <Code2 className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Secure by Design",
        description: "Enterprise-grade security with encrypted sessions.",
        header: <SecurityHeader />,
        icon: <Lock className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Lightning Fast Execution",
        description:
            "Run your code in secure, isolated sandboxes. Get results in milliseconds.",
        header: <SpeedHeader />,
        icon: <Zap className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Global Edge Network",
        description: "Deployed on the edge for maximum performance anywhere.",
        header: <NetworkHeader />,
        icon: <Globe className="h-4 w-4 text-neutral-500" />,
    },
];
