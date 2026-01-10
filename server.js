require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');

// Hardened Origin Check
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
        // In local dev, origin might be missing (e.g. strict server-side fetches or curl),
        // but for a browser connection it should be present.

        // Security: Allow if specifically listed OR if no origin (local tools/scripts)
        // CAUTION: In rigorous prod, you might want to block !origin, but for dev flexibilty we allow it.
        const isAllowed = !origin || ALLOWED_ORIGINS.includes(origin);

        if (isAllowed) {
            cb(true);
        } else {
            console.warn(`[Security] Blocked connection from unauthorized origin: ${origin}`);
            cb(false, 403, 'Forbidden');
        }
    }
});

const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Yjs WebSocket Server (Secure & Optimized)');
});

wss.on('connection', (ws, req) => {
    // Standard Yjs setup
    setupWSConnection(ws, req);

    // Heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
});

// Interval to clean up dead connections (Optimization)
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

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
