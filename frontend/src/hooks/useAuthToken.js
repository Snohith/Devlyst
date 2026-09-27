import { useAuth } from "@clerk/clerk-react";
import { hasClerk } from "../lib/config";

export function useAuthToken() {
  if (!hasClerk) {
    return { getToken: async () => null, isLoaded: true, isSignedIn: true };
  }
  return useAuth();
}
