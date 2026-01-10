#!/bin/bash
echo "🚀 Deploying Devlyst Locally..."

# Kill potentially conflicting processes
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:1234 | xargs kill -9 2>/dev/null

# Start WS Server
export NODE_ENV=production
nohup node server.js > server.log 2>&1 &
echo "✅ WebSocket Server started on port 1234"

# Start Next.js
nohup npm start > next.log 2>&1 &
echo "✅ Next.js App started on port 3000"

echo "🎉 Deployment Complete!"
echo "👉 http://localhost:3000"
