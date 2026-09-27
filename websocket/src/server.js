import { WebSocketServer } from "ws";
import { verifyConnection } from "./auth/verify.js";
import { config } from "./config.js";
import { attachConnection } from "./rooms/registry.js";

const server = new WebSocketServer({
  port: config.port,
  host: config.host,
});

server.on("connection", async (connection, request) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const access = await verifyConnection(request);

  if (!access.ok) {
    connection.close(4001, access.message);
    return;
  }

  access.token = url.searchParams.get("token");
  attachConnection(connection, request, access);
  console.log(JSON.stringify({
    level: "info",
    message: "collaboration connection opened",
    projectId: access.projectId,
    userId: access.userId,
  }));
});

server.on("listening", () => {
  console.log(JSON.stringify({
    level: "info",
    message: "websocket listening",
    port: config.port,
    host: config.host,
  }));
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
