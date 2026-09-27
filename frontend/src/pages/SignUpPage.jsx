import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { hasClerk } from "../lib/config";

export function SignUpPage() {
  if (!hasClerk) {
    return <main className="grid min-h-screen place-items-center text-zinc-300">Clerk is not configured. <Link to="/dashboard" className="ml-2 underline">Continue</Link></main>;
  }
  return <main className="grid min-h-screen place-items-center bg-zinc-950"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" /></main>;
}
