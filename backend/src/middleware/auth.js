import { AuthenticationError } from "../errors/app-error.js";
import { userRepository } from "../repositories/user-repository.js";
import { verifySessionToken } from "../services/clerk.js";
import { syncUserFromClaims } from "../services/user-service.js";

function readBearerToken(header) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = readBearerToken(req.headers.authorization);
    const claims = await verifySessionToken(token);
    let user = await userRepository.findByClerkId(claims.sub);
    if (!user) {
      user = await syncUserFromClaims(claims);
    }
    req.auth = { clerkId: claims.sub, sessionId: claims.sid };
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AuthenticationError ? error : new AuthenticationError());
  }
}
