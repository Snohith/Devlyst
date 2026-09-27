# Devlyst Architecture & Deployment Guide

Devlyst runs as three loosely coupled parts:

```
[ Web app: Next.js + React + Tailwind + Monaco ]
       │                                  │
  HTTP (route /api/execute → Judge0)     │ WebSocket (Yjs CRDT sync)
       ▼                                  ▼
    [ Judge0 ]                    [ WebSocket: server.js ]
                                         │
[ Backend: Express + Prisma ] (optional REST API for projects/users)
       │
[ PostgreSQL Database ]
```

The web app and the WebSocket server are the product; the Express backend is
optional and only needed if you want the projects/users REST API.

## Running Locally

### Prerequisites
- Node.js >= 20
- PostgreSQL database, only for the optional backend (or use `docker compose up -d db`)

### Environment Variables
The web app reads `.env.local` at the repository root (see `.env.example`):
- `NEXT_PUBLIC_APP_URL`: public url of the app, used for metadata and origin checks
- `NEXT_PUBLIC_WS_URL` (or `NEXT_PUBLIC_WS_HOST` + `NEXT_PUBLIC_WS_PORT`): where to reach the Yjs server
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`: Clerk auth keys
- `JUDGE0_API_URL` (optional): `https://ce.judge0.com` — base url of the Judge0 CE instance used for code execution. Set `JUDGE0_API_KEY` / `JUDGE0_API_HOST` when pointing at a RapidAPI-hosted Judge0 instance.

The backend reads `.env` in the repository root or in `backend/`:
- `DATABASE_URL`: `postgresql://devlyst:devlyst_dev_password@localhost:5432/devlyst?schema=public`
- `CLERK_SECRET_KEY`: Your Clerk Secret Key
- `CLIENT_ORIGINS`: comma-separated origins allowed to call the API (defaults to `http://localhost:3000`)

### 1. WebSocket Server
```bash
node server.js
# Running on ws://localhost:1234
```

### 2. Web App
```bash
npm install
npm run dev
# Running on http://localhost:3000
```

### 3. Backend API (optional)
```bash
cd backend
npm install
npx prisma db push # Or npx prisma migrate dev
npm run dev
# Running on http://localhost:4000
```

### Docker Compose
Run the web app, the WebSocket server, the backend and PostgreSQL with Docker:
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

