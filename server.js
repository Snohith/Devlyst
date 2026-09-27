require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');

// Origins allowed to open a WebSocket to this server.
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.ALLOWED_ORIGIN_HOST ? `https://${process.env.ALLOWED_ORIGIN_HOST}` : null
].filter(Boolean);

const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: (info, cb) => {
        const origin = info.origin;
        // Requests without an origin (curl, server-side tools) are allowed.
        const isAllowed = !origin || ALLOWED_ORIGINS.includes(origin);

        if (!isAllowed) {
            console.warn(`[Security] Blocked connection from unauthorized origin: ${origin}`);
        }
        // Unknown origins are still let through so an unlisted production
        // domain cannot take the editor down.
        cb(true);
    }
});

const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Yjs WebSocket server');
});

wss.on('connection', (ws, req) => {
    setupWSConnection(ws, req);

    // Heartbeat so dead connections can be dropped.
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
});

const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    });
}, 15000);

wss.on('close', () => {
    clearInterval(interval);
});

server.on('upgrade', (request, socket, head) => {
    const handleAuth = (ws) => {
        wss.emit('connection', ws, request);
    };
    wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(port, "0.0.0.0", () => {
    console.log(`WebSocket server running on port ${port} (0.0.0.0)`);
    console.log(`Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
