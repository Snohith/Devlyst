import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(serviceRoot, "..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(serviceRoot, ".env") });

export const config = {
  port: Number(process.env.WS_PORT || 1234),
  host: process.env.WS_HOST || "0.0.0.0",
  apiUrl: process.env.API_URL || "http://localhost:4000",
  clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
  persistDebounceMs: Number(process.env.WS_PERSIST_DEBOUNCE_MS || 1500),
  gcEnabled: process.env.YJS_GC !== "false",
};
