import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { hasClerk } from "../../lib/config";

export function ProtectedRoute({ children }) {
  if (!hasClerk) return children;

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
