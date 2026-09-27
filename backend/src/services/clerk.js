import { createClerkClient, verifyToken } from "@clerk/backend";
import { env, requireClerkSecret } from "../config/env.js";
import { AuthenticationError } from "../errors/app-error.js";

let clerkClient;

function getClerk() {
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey: requireClerkSecret() });
  }
  return clerkClient;
}

export async function verifySessionToken(token) {
  if (!token) {
    throw new AuthenticationError("Missing session token");
  }

  try {
    return await verifyToken(token, {
      secretKey: requireClerkSecret(),
    });
  } catch {
    throw new AuthenticationError("Invalid or expired session token");
  }
}

export async function getClerkUser(clerkId) {
  return getClerk().users.getUser(clerkId);
}

export function clerkIdentityFromUser(user) {
  const email = user.emailAddresses?.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress
    || user.emailAddresses?.[0]?.emailAddress
    || null;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    || user.username
    || email
    || "Developer";

  return {
    clerkId: user.id,
    email,
    displayName,
    imageUrl: user.imageUrl || null,
  };
}

export function hasClerkConfig() {
  return Boolean(env.clerkSecretKey);
}
