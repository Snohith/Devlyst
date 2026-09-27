import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

interface User {
    clientID: number;
    user: {
        name: string;
        color: string;
    };
}

interface UserListProps {
    users: User[];
    onFollow?: (clientId: number) => void;
    followedUserId?: number | null;
}

export default function UserList({ users, onFollow, followedUserId }: UserListProps) {
    if (users.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden px-2 py-1 items-center hover:space-x-1 transition-all duration-300">
                {users.map((user, i) => {
                    const isFollowed = followedUserId === user.clientID;
                    // Ensure name exists
                    const name = user.user?.name || "Anonymous";
                    const initial = name.charAt(0).toUpperCase();

                    return (
                        <div key={user.clientID || i} className="group relative">
                            {/* Avatar */}
                            <div
                                onClick={() => onFollow && onFollow(user.clientID)}
                                className={cn(
                                    "relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white shadow-sm cursor-pointer transition-transform hover:scale-110 hover:z-20",
                                    isFollowed ? "ring-2 ring-white ring-offset-2 ring-offset-black z-10" : "opacity-90 hover:opacity-100"
                                )}
                                style={{ backgroundColor: user.user?.color || "#999" }}
                            >
                                {initial}
                                {isFollowed && (
                                    <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-[2px]">
                                        <Eye className="w-2 h-2" />
                                    </div>
                                )}
                            </div>

                            {/* Tooltip Name Tag (Visible on Hover) */}
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                                {name}
                                {/* Arrow */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 border-t border-l border-white/10"></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Count Badge */}
            <div className="flex h-6 px-2 items-center justify-center rounded-full bg-zinc-800/50 border border-white/10 text-[10px] font-medium text-zinc-400">
                {users.length} online
            </div>
        </div>
    );
}
