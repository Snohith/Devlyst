export const config = {
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
  apiUrl: import.meta.env.VITE_API_URL || "",
  websocketUrl: import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:1234",
};

export const hasClerk = Boolean(config.clerkPublishableKey);
