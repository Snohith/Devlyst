FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY websocket ./websocket

WORKDIR /app/websocket
RUN npm ci --omit=dev

ENV NODE_ENV=production
EXPOSE 1234
CMD ["node", "src/server.js"]
