# Use Node.js LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# --- Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js

# Expose ports
# Next.js
EXPOSE 3000
# WebSocket Server
EXPOSE 1234

# Startup script to run BOTH servers
# Note: In a real orchestrator (K8s), these should be separate pods.
# For simple deployment, we use a shell script or concurrently.
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'node server.js & nid=$!' && \
    echo 'npm start & nid2=$!' && \
    echo 'wait $nid $nid2' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
