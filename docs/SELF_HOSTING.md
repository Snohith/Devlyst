# Running and hosting Devlyst

Everything you need to get Devlyst running locally or on a server, plus the parts that tend to go
wrong.

## What you need

- Node.js 20 or newer. The Render blueprint pins 20.10.0; newer works too.
- npm. There's no lockfile for yarn or pnpm, only `package-lock.json`.
- A host that can run two long-lived processes if you're deploying (Render, Fly, a VPS). The
  collaboration server is a WebSocket relay, so it needs a process that stays up — a serverless
  function host won't work for it.
- Optional: Clerk keys for sign-in. Optional: your own Judge0 if you don't want to depend on the
  public one.

Nothing else. There's no database to provision and no seed step.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. For local development you can skip
this entirely — the defaults in the code already point at localhost.

| Variable | Read by | Default | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | app metadata, `/api/execute` origin check, WS origin list | `https://devlyst-web.onrender.com` | Set this to the URL you actually visit, or origin checks get confusing. |
| `NEXT_PUBLIC_WS_URL` | `useCollaboration` | none | Full socket URL, e.g. `ws://localhost:1234`. Wins over the host/port pair below. |
| `NEXT_PUBLIC_WS_HOST` | `useCollaboration` | current hostname | Hostname only, no scheme or port. |
| `NEXT_PUBLIC_WS_PORT` | `useCollaboration` | none | Appended to the host unless it's `443` or `80`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | layout, middleware, sign-in pages | none | Without it, auth is skipped everywhere. |
| `CLERK_SECRET_KEY` | Clerk middleware | none | Needed alongside the publishable key. |
| `PORT` | `server.js` | `1234` | The socket server's port. |
| `ALLOWED_ORIGIN_HOST` | `server.js` | none | Hostname only; the code prefixes `https://`. |
| `JUDGE0_API_URL` | `/api/execute` | `https://ce.judge0.com` | Trailing slashes are stripped. |
| `JUDGE0_API_KEY` | `/api/execute` | none | Only for a RapidAPI-hosted Judge0. |
| `JUDGE0_API_HOST` | `/api/execute` | none | Only for a RapidAPI-hosted Judge0. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `src/app/layout.tsx` | none | Set it and the Plausible script loads; leave it empty and nothing is tracked. |
| `RENDER_EXTERNAL_URL` | `src/lib/security.ts` | none | Render sets this on its own. |

Three things to remember about these:

**`NEXT_PUBLIC_*` values are baked into the bundle at build time.** Next.js inlines them, so editing
one means rebuilding and redeploying — restarting the process does nothing. This bites people most
often with `NEXT_PUBLIC_WS_URL`.

**The socket URL has a fallback chain.** `resolveSocketUrl()` in
`src/hooks/useCollaboration.ts` uses `NEXT_PUBLIC_WS_URL` if it's set. Otherwise it picks `ws` or
`wss` from the page's protocol, uses `NEXT_PUBLIC_WS_HOST` if present (with one special case:
the value `devlyst-ws` is rewritten to `devlyst-ws.onrender.com`, because Render injects the internal
service name) or falls back to `window.location.hostname`, then appends `NEXT_PUBLIC_WS_PORT` unless
it's `443` or `80`. That's why the Render blueprint sets the port to 443: the browser needs `wss`,
never `:1234`.

**`ALLOWED_ORIGIN_HOST` is cosmetic right now.** It's logged, not enforced — see the security section
of [ARCHITECTURE.md](ARCHITECTURE.md).

## Local development

Two terminals, because they're two processes.

```bash
npm install
```

```bash
# terminal 1
node server.js
# WebSocket server running on port 1234 (0.0.0.0)
```

```bash
# terminal 2
npm run dev
# http://localhost:3000
```

Sanity check the socket server on its own if collaboration misbehaves — a plain GET returns a short
text response:

```bash
curl http://localhost:1234
# Yjs WebSocket server
```

Then create a room from the dashboard and open the same URL in a second browser window (or an
incognito window, so you get two separate clients).

## Using your own Judge0

The default is the public CE instance, which is fine for trying things out and rate limited in ways
you don't control. For anything real, run Judge0 yourself and point the app at it:

```bash
JUDGE0_API_URL=https://judge0.example.com
```

Two follow-ups when you do that:

1. Add your Judge0 origin to the `connect-src` list in the Content-Security-Policy in
   `next.config.ts`. Browsers won't let the page talk to a host that isn't listed, and the failure
   looks like a silent network error rather than anything mentioning Judge0.
2. Rebuild, since it's a server-side variable only in the API route, but the CSP above is baked into
   the response headers at build time.

For a RapidAPI-hosted instance, also set `JUDGE0_API_KEY` and `JUDGE0_API_HOST`; the client adds the
`X-RapidAPI-Key` and `X-RapidAPI-Host` headers when they're present.

The execution limits are hardcoded in `JUDGE0_LIMITS` in `src/lib/judge0.ts` — 5 s CPU, 10 s wall
time, 128 MB — and sent with every submission. Change them there if you want different ceilings.

## Deploying to Render

`render.yaml` is a blueprint that describes both services, so there's little to do by hand:

```bash
# push your fork, then in Render: New > Blueprint, pick the repo
```

What it creates:

- **`devlyst-web`** — `npm install && npm run build`, started with `npm start`, Node 20.10.0. It gets
  `NEXT_PUBLIC_WS_PORT=443` and a `NEXT_PUBLIC_WS_HOST` taken from the other service's host.
- **`devlyst-ws`** — `npm install` and `node server.js` on port 1234, with `ALLOWED_ORIGIN_HOST` taken
  from the web service's host.

Two values are left for you to fill in after the first deploy:

- `NEXT_PUBLIC_APP_URL` on `devlyst-web` is `sync: false`, so Render prompts for it. Use the URL you'll
  actually open, `https://devlyst-web.onrender.com` unless you've attached a domain.
- Clerk keys, if you want sign-in. Add both, or neither.

Because `NEXT_PUBLIC_APP_URL` and the WebSocket host are build-time values, set them and then trigger a
fresh deploy — a restart alone won't pick them up.

On the free plan both services sleep after a period of inactivity, so the first visitor waits for the
web app to wake and for the socket to come back. Yjs reconnects on its own, and the status dot in the
room header turns green when it does.

## Deploying somewhere else

The shape is the same: run `npm run build && npm start` for the app and `node server.js` for the relay,
with the socket server reachable from the browser.

- **Same hostname, different ports.** Easiest if you control DNS: `app.example.com` and
  `ws.example.com`, with `NEXT_PUBLIC_WS_URL=wss://ws.example.com`. Terminate TLS at your proxy and
  forward upgrades to the socket process.
- **Path-based proxying needs care.** `y-websocket` connects to `<serverUrl>/<roomId>`, so the room id
  is part of the path. A rule that forwards only `/ws` to the relay won't work; you have to forward
  `/ws/*` including the room segment and keep the path intact.
- **Serverless is out for the relay.** It holds the room documents in memory and needs to keep sockets
  open, so it wants a real process. The Next app itself is fine on a serverless host.
- **Static export is out too.** `/api/execute` and `src/middleware.ts` both need a Node server, so
  `output: "export"` isn't an option without giving up code execution.

## When something breaks

| What you see | What it usually means | What to do |
| --- | --- | --- |
| "Could not reach the collaboration server." | The relay isn't running, or the browser is pointed at the wrong host/port. | `curl http://localhost:1234`, then check `NEXT_PUBLIC_WS_URL` / host / port. On an HTTPS page the socket must be `wss://`. |
| The page loads but cursors and edits never arrive | Same as above, plus a CSP that doesn't allow the socket origin. | Look at the browser console for a blocked WebSocket, and confirm the room id matches. |
| "Code execution service is unavailable." | Judge0 didn't answer within 15 s, or the host is unreachable from your server. | Retry, then point `JUDGE0_API_URL` at an instance you control. |
| "Code execution is rate limited right now." | Judge0 answered 429, or you hit the app's own 20-per-minute limit. | Wait a few seconds. The app's limit is per process and per IP. |
| "Execution took too long and was aborted." | The poll deadline of 25 s passed. | Almost always an infinite loop or a program waiting on stdin, which the UI never sends. |
| "Code execution service rejected the request." | Judge0 answered 422, usually a language id or limit the instance doesn't support. | Check the language ids against your instance's `/languages`. |
| `403 Forbidden` from `/api/execute` | The `Origin` you're browsing from isn't in the allowlist. | Set `NEXT_PUBLIC_APP_URL` to that origin and rebuild. |
| The format button does nothing | Prettier has no parser for that language. | Only JavaScript, TypeScript, JSON, HTML, CSS, Markdown and YAML are formatted. The console logs a warning. |
| "Authentication is disabled (Missing Publishable Key)" | Clerk keys aren't set. | Expected without keys. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to enable sign-in. |
| No service worker in development | `next-pwa` is disabled when `NODE_ENV=development`. | Test the PWA with `npm run build && npm start`. |

If you're stuck, the browser console plus the two process logs (the Next server and `server.js`) will
tell you which of the three moving parts is unhappy.
