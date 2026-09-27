import { SignIn } from "@clerk/clerk-react";
import { hasClerk } from "../lib/config";
import { Link } from "react-router-dom";

export function SignInPage() {
  if (!hasClerk) {
    return <main className="grid min-h-screen place-items-center text-zinc-300">Clerk is not configured. <Link to="/dashboard" className="ml-2 underline">Continue</Link></main>;
  }
  return <main className="grid min-h-screen place-items-center bg-zinc-950"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" /></main>;
}
