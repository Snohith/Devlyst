import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-zinc-400">
                Authentication is disabled (Missing Publishable Key)
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-neutral-900 border border-white/10 shadow-2xl",
                        }
                    }}
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                />
            </div>
        </div>
    );
}
