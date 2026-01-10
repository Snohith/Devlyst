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
        <div className="flex -space-x-2 overflow-hidden px-2 py-1 items-center">
            {users.map((user, i) => {
                const isFollowed = followedUserId === user.clientID;
                return (
                    <div
                        key={user.clientID || i}
                        onClick={() => onFollow && onFollow(user.clientID)}
                        className={cn(
                            "relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white shadow-sm cursor-pointer transition-transform hover:scale-110 hover:z-10",
                            isFollowed ? "ring-2 ring-white ring-offset-2 ring-offset-black z-10" : "opacity-90 hover:opacity-100"
                        )}
                        style={{ backgroundColor: user.user?.color || "#999" }}
                        title={user.user?.name || "Anonymous"}
                    >
                        {user.user?.name?.charAt(0) || "U"}
                        {isFollowed && (
                            <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-[2px]">
                                <Eye className="w-2 h-2" />
                            </div>
                        )}
                    </div>
                );
            })}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-zinc-800 text-[10px] font-medium text-zinc-400 ml-2">
                {users.length}
            </div>
        </div>
    );
}
