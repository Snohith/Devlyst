import { sendData } from "../utils/response.js";
import { getCurrentUser, serializeUser, syncUserFromClaims } from "../services/user-service.js";

export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    sendData(res, serializeUser(user));
  } catch (error) {
    next(error);
  }
}

export async function syncMe(req, res, next) {
  try {
    const user = await syncUserFromClaims(req.auth, req.body.displayName);
    req.user = user;
    sendData(res, serializeUser(user));
  } catch (error) {
    next(error);
  }
}
