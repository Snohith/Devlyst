import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/room(.*)',
]);

// Wrap Clerk middleware to avoid errors if keys are missing (e.g. during build)
const clerkHandler = clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
});

export default function middleware(req: any, ctx: any) {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        return NextResponse.next();
    }
    return clerkHandler(req, ctx);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
