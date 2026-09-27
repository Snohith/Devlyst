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
- `JUDGE0_API_URL` (optional): `https://ce.judge0.com` — base url of the Judge0 CE instance used for code execution. Set `JUDGE0_API_KEY` / `JUDGE0_API_HOST` when pointing at a RapidAPI-hosted Judge0 instance.

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

## Code Execution (Judge0)

Code runs through the [Judge0 Community Edition](https://ce.judge0.com) API. Both execution
entry points share the same language map:

- `src/lib/judge0.ts` — used by the Next.js route `src/app/api/execute/route.ts`
- `shared/constants/languages.js` (`JUDGE0_LANGUAGES`) — used by the Express backend
  (`backend/src/services/execution-service.js`)

Submissions are created with `wait=false` and polled until a terminal status, so a single
long-blocking request can never be cut off by edge/proxy timeouts.

| Language   | Judge0 id | Runtime                  |
| ---------- | --------- | ------------------------ |
| JavaScript | 93        | Node.js 18.15.0          |
| TypeScript | 94        | TypeScript 5.0.3         |
| Python     | 92        | Python 3.11.2            |
| Java       | 91        | JDK 17.0.6               |
| C          | 103       | GCC 14.1.0               |
| C++        | 105       | GCC 14.1.0               |
| C#         | 51        | Mono 6.6.0.161           |
| Go         | 107       | Go 1.23.5                |
| Rust       | 108       | Rust 1.85.0              |
| PHP        | 98        | PHP 8.3.11               |
| Ruby       | 72        | Ruby 2.7.0               |
| SQL        | 82        | SQLite 3.27.2            |

Limits: 5s CPU / 10s wall time / 128 MB memory. HTML and CSS remain editable in the editor
but cannot be executed. Judge0 answers with HTTP 200 even for compile/runtime failures, so
`/api/execute` reports them through the `error`, `stderr`, `compileOutput`, `exitCode` and
`status` fields while `output` carries stdout.

