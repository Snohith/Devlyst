"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface AuthIdentitySyncProps {
    onUserSync: (name: string) => void;
}

export function AuthIdentitySync({ onUserSync }: AuthIdentitySyncProps) {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            const name = user.fullName || user.firstName || "Anonymous";
            onUserSync(name);
        }
    }, [isLoaded, user, onUserSync]);

    return null;
}
