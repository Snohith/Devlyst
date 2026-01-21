"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface AIAssistantProps {
    code?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AIAssistant({ code, isOpen, onClose }: AIAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your AI Copilot. I can help you write, debug, or explain code. How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg, code: code }),
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.response || "Something went wrong." }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 h-full border-l border-white/10 bg-zinc-900/60 backdrop-blur-xl flex flex-col shadow-2xl z-20 shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-violet-400">
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span className="font-bold text-sm tracking-wide text-white">AI Copilot</span>
                </div>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10",
                            msg.role === "assistant" ? "bg-violet-600/20 text-violet-400" : "bg-zinc-700 text-zinc-300"
                        )}>
                            {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <div className="text-xs font-bold">You</div>}
                        </div>
                        <div className={cn(
                            "rounded-lg p-3 text-sm max-w-[85%] leading-relaxed",
                            msg.role === "assistant"
                                ? "bg-zinc-800/50 border border-white/5 text-zinc-300"
                                : "bg-violet-600/20 text-white border border-violet-500/20"
                        )}>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center border border-white/10">
                            <Bot className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="bg-zinc-800/50 border border-white/5 rounded-lg p-3 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your code..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-1.5 top-1.5 p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
