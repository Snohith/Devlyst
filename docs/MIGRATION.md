# Devlyst Migration & Deployment Guide

Devlyst has been decomposed from a Next.js monolith into a 3-tier decoupled architecture:

```
[ Frontend: React + Vite + Tailwind ]
       │                      │
  HTTP REST (Clerk Bearer)    │ WebSocket (Yjs + Clerk Token)
       ▼                      ▼
[ Backend: Express + Prisma ] ◄─► [ WebSocket: Dedicated Yjs Server ]
       │
[ PostgreSQL Database ]
```

## Running Locally

### Prerequisites
- Node.js >= 20
- PostgreSQL database (or use `docker compose up -d db`)

### Environment Variables
Configure your root `.env` or set in each package:
- `DATABASE_URL`: `postgresql://devlyst:devlyst_dev_password@localhost:5432/devlyst?schema=public`
- `CLERK_SECRET_KEY`: Your Clerk Secret Key
- `CLERK_PUBLISHABLE_KEY` (or `VITE_CLERK_PUBLISHABLE_KEY`): Your Clerk Publishable Key
- `PISTON_URL`: `https://emkc.org/api/v2/piston/execute`

### 1. Database & Backend
```bash
cd backend
npm install
npx prisma db push # Or npx prisma migrate dev
npm run dev
# Running on http://localhost:4000
```

### 2. WebSocket Server
```bash
cd websocket
npm install
npm run dev
# Running on ws://localhost:1234
```

### 3. Frontend Client
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### Docker Compose
Run the entire stack with Docker:
```bash
docker compose up --build
```
