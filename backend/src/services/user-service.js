import { userRepository } from "../repositories/user-repository.js";
import { clerkIdentityFromUser, getClerkUser } from "./clerk.js";

export function serializeUser(user) {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    displayName: user.displayName,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function syncUserFromClaims(claims, displayNameOverride) {
  const clerkUser = await getClerkUser(claims.sub);
  const identity = clerkIdentityFromUser(clerkUser);
  if (displayNameOverride) {
    identity.displayName = displayNameOverride;
  }
  return userRepository.upsertFromClerk(identity);
}

export async function getCurrentUser(userId) {
  return userRepository.findById(userId);
}
