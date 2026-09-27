import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const repoRoot = path.resolve(backendRoot, "..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env") });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseOrigins(value) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in production");
}

export const env = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === "test",
  port: Number(process.env.API_PORT || process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  clientOrigins: parseOrigins(
    process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173",
  ),
  databaseUrl: process.env.DATABASE_URL || "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || "",
  judge0ApiUrl: (process.env.JUDGE0_API_URL || "https://ce.judge0.com").replace(/\/+$/, ""),
  // Optional: only needed when pointing at a RapidAPI-hosted Judge0 instance.
  judge0ApiKey: process.env.JUDGE0_API_KEY || "",
  judge0ApiHost: process.env.JUDGE0_API_HOST || "",
  websocketUrl: process.env.WEBSOCKET_PUBLIC_URL || "ws://localhost:1234",
  logLevel: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
};

export function requireDatabaseUrl() {
  return required("DATABASE_URL");
}

export function requireClerkSecret() {
  return required("CLERK_SECRET_KEY");
}
