FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend
RUN npm ci
RUN npx prisma generate

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend ./backend

WORKDIR /app/backend
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/server.js"]
