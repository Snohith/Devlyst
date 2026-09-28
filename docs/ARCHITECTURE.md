# How Devlyst works

Devlyst is two Node processes and one third-party API. There is no database, no REST backend, and no
server-side persistence of anything you type.

```
  browser
    │
    ├── HTTP ────────────────────────────────►  Next.js app (`src/`)
    │                                            └── /api/execute ──► Judge0 CE
    │
    └── WebSocket (Yjs CRDT) ────────────────►  server.js   (relays updates)
```

An earlier version of this document described a third, optional Express + Prisma + PostgreSQL
backend and a Docker Compose setup for it. None of that code is in this repository, so this document
covers only what ships here.

## The pieces

| Piece | Files | What it is |
| --- | --- | --- |
| Web app | `src/`, `next.config.ts`, `render.yaml` | Next.js 16 (App Router) + React 19 + Tailwind + Monaco. Runs on port 3000, deploys as `devlyst-web`. |
| Collaboration server | `server.js` | A `ws` server built on `y-websocket`'s `setupWSConnection`. Port 1234 locally, deploys as `devlyst-ws`. |
| Judge0 | not in this repo | Public Judge0 CE HTTP API (`https://ce.judge0.com` by default) that compiles and runs submitted code. |
| Clerk | `src/middleware.ts`, `src/components/AuthIdentitySync.tsx` | Optional accounts. The app runs fine without it. |

## The shared document

Every room is one Yjs document. `src/hooks/useCollaboration.ts` creates a `Y.Doc`, opens a
`WebsocketProvider` against the room id from the URL, and hands both to the room page. `server.js`
only relays updates between sockets in the same room — it never inspects them. Nothing is written to
disk, so a room lasts exactly as long as someone is connected to it.

Inside the document there are two kinds of state:

- **`files`** — a `Y.Map` of filename → `Y.Text`. This is both the file tree and the file contents.
  `src/components/FileExplorer.tsx` creates `main.js` with a welcome comment when a room has no files
  yet, and `handleDownload` zips every `Y.Text` in the map for a one-click export.
- **awareness** — a separate y-protocols channel for things that shouldn't be permanent: display
  name, colour, caret position, typing flag. It's discarded on disconnect.

Editing is CRDT-based, so two people typing in the same spot merges instead of conflicting. There's
no locking, no "someone else is editing this file" state, and no merge-conflict dialog.

### What happens when you open `/room/12345`

1. The room page (`src/app/room/[roomId]/page.tsx`) calls `useCollaboration("12345")`.
2. `WebsocketProvider` connects to whatever `resolveSocketUrl()` returns and joins the room named
   `12345`. It exchanges state vectors with the server, so a client that was away catches up in a
   single round trip.
3. `FileExplorer` reads the `files` map and creates `main.js` if the room is empty. That write goes
   through Yjs, so everyone already in the room sees the new file appear.
4. `CollaborativeEditor` binds its Monaco model to `files[currentFile]` using `MonacoBinding` from
   `y-monaco`. Switching files tears the binding down and builds a new one against the new `Y.Text`.
5. A keystroke becomes a Yjs update, goes to `server.js`, fans out to the other clients, and lands in
   their Monaco models. Cursors travel over awareness instead, so they never enter the document
   history.

Room ids are whatever the URL says. The dashboard generates a random five-digit code and the join box
only accepts five digits, but the room page itself does no validation — any string becomes a room
name.

## Presence, names and follow mode

- `src/hooks/useCursorBroadcasting.ts` publishes `user` (`{ name, color }`) once, then broadcasts
  `cursorLocation` on every caret move, throttled to one update per 100 ms.
- `CollaborativeEditor` sets an `isTyping` flag on content change and clears it a second later.
  `TypingIndicator` turns that into "X is typing...".
- `UserList` renders the avatars plus an "N online" count. Clicking one calls `onFollow`, which sets
  `followUserId`, and `src/hooks/useFollowUser.ts` calls `revealPositionInCenter` whenever that
  person's caret moves. Following only scrolls your viewport; your own cursor stays yours.
- The display name comes from Clerk (`fullName` or `firstName`) when you're signed in. Otherwise it's
  the `devlyst-username` entry in `localStorage`, defaulting to "Anonymous".

## How running code works

1. `runCode()` in the room page reads `editor.getValue()` and POSTs `{ code, language }` to
   `/api/execute` with `fetch`.
2. The route (`src/app/api/execute/route.ts`) checks things in this order: `Origin`/`Referer` against
   the allowlist (403), per-IP rate limit of 20 runs a minute (429), the JSON body (400), empty
   source (400), source over 100 KB (400), and whether the language has a rule in the runtime map
   (400, and the error lists the languages that can run).
3. `src/lib/judge0.ts` builds the submission — language id, source, and explicit limits of 5 s CPU,
   10 s wall time and 128 MB — and creates it with `wait=false`.
4. Since a non-blocking create only returns a token, the code polls `GET /submissions/{token}` every
   400 ms until the status is neither "In Queue" nor "Processing", or 25 s elapse. Three failed polls
   in a row abort the wait, each HTTP call has its own 15 s timeout, and a create request that times
   out or can't reach the host is retried once.
5. Judge0 answers 200 even when code fails to compile, so the route reads the status object instead:
   `stdout`, `stderr`, `compile_output` and `exit_code` become `output`, `stderr`, `compileOutput`
   and `exitCode`, alongside `signal`, `status`, `timeMs` and `memoryKb`. `ExecutionPanel` prints
   them under a line like `Accepted • exit 0 • 0.04s`.
6. The route sets `maxDuration = 30` so the host gives the function long enough to finish a
   compile-and-run.

Two edges worth knowing. The route accepts an optional `stdin` string and forwards it to Judge0, but
the UI never sends one, so a program that reads from stdin gets EOF. And if the poll deadline passes,
the route returns a timeout error and leaves the submission to expire on Judge0's side — there's no
cleanup call.

## Languages

`src/lib/judge0.ts` holds the one runtime map. Ids were taken from `https://ce.judge0.com/languages`.

| Key in the map | Judge0 id | Runtime |
| --- | --- | --- |
| `javascript` | 93 | Node.js 18.15.0 |
| `typescript` | 94 | TypeScript 5.0.3 |
| `python` | 92 | Python 3.11.2 |
| `java` | 91 | JDK 17.0.6 |
| `c` | 103 | GCC 14.1.0 |
| `cpp` | 105 | GCC 14.1.0 |
| `csharp` | 51 | Mono 6.6.0.161 |
| `go` | 107 | Go 1.23.5 |
| `rust` | 108 | Rust 1.85.0 |
| `php` | 98 | PHP 8.3.11 |
| `ruby` | 72 | Ruby 2.7.0 |
| `sql` | 82 | SQLite 3.27.2 |

Two mismatches between what can run and what the UI offers, both worth knowing:

- **C** is in the map, so `POST /api/execute` with `language: "c"` runs, but
  `src/components/LanguageSelector.tsx` doesn't list it and the extension map in the room page has no
  `c` entry, so nobody can pick it from the interface today.
- **HTML and CSS** are the other way round. They're in the dropdown and the extension map, but not in
  the Judge0 map, so they're editable and exportable but not runnable. The route answers those with a
  400 and an error that lists what can run.

Formatting is separate from execution. `src/lib/formatter.ts` wires up Prettier's standalone build
with parsers for JavaScript, TypeScript, JSON, HTML, CSS, Markdown and YAML. For anything else it logs
a warning and returns your code unchanged. This is why the wand button appears to do nothing in a
Python or Go file.

## Rooms, links and sign-in

Room ids are the security boundary that matters most here, and they're deliberately weak: five digits,
and the WebSocket server accepts anyone who knows the name. There's no invite check, no session
verification on the socket, and `setupWSConnection` doesn't care who connects. Treat a room code like
a shared password and don't put anything sensitive in a room.

On the web side, `src/middleware.ts` protects `/dashboard` and `/room/*` with
`clerkMiddleware`. The whole handler is skipped when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing,
which is the supported way to run a self-hosted copy without accounts — everything is open and
visitors choose their own display name. `/sign-in` and `/sign-up` notice the missing key too and
render "Authentication is disabled (Missing Publishable Key)" instead of a form.

## Security checks in the repo

There are four of them, and it's worth being precise about how strong each one is.

**Response headers** (`next.config.ts`) apply to every route: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a
Content-Security-Policy. The CSP is deliberately loose in a few places because Monaco needs
`blob:` workers and `unsafe-eval`, and because collaboration needs arbitrary `ws:`/`wss:` hosts. It
also whitelists `https://ce.judge0.com`, `*.onrender.com`, `cdn.jsdelivr.net` and Clerk. If you point
`JUDGE0_API_URL` at your own Judge0, add that origin to `connect-src` or runs will fail in the
browser.

**Origin checking on `/api/execute`** (`src/lib/security.ts`) compares `Origin` and `Referer` against
`localhost:3000`, `127.0.0.1:3000`, `https://devlyst-web.onrender.com`, `NEXT_PUBLIC_APP_URL` and
`RENDER_EXTERNAL_URL`. A request with neither header passes, on the assumption it's server-to-server.
This stops another website from using your deployment as a free code-running proxy, not a determined
attacker.

**Rate limiting** is an in-memory `Map` in the same file: 20 runs per 60 seconds per IP, where the IP
comes from `x-forwarded-for`, then `x-real-ip`, then `127.0.0.1`. It's per process, so instances don't
share a counter and a redeploy clears it. Fine as a speed bump, not a quota system.

**WebSocket origin checking** in `server.js` builds the same kind of allowlist from
`NEXT_PUBLIC_APP_URL` and `ALLOWED_ORIGIN_HOST`, then... logs. `verifyClient` ends with `cb(true)`
unconditionally, so an unknown origin gets a warning in the logs and a working connection. That's a
deliberate trade-off in the current code — a misconfigured production domain would otherwise take the
editor down — but don't mistake it for a gate. It's the place to tighten if you self-host for a team.

One thing no check covers: your code leaves your machine. Every run is compiled and executed on
Judge0's servers, so treat it like pasting code into a third-party site.

## Code map

| File | Responsibility |
| --- | --- |
| `src/app/page.tsx`, `src/components/HomeClient.tsx` | Landing page: navbar, hero, feature grid, footer |
| `src/app/room/[roomId]/page.tsx` | The room shell. Owns language, current file, run state, copy-link, and the follow-user state |
| `src/app/dashboard/page.tsx` | Create a random room or join by code; display-name settings |
| `src/app/api/execute/route.ts` | The only API route. Validates, rate limits, calls Judge0, maps the result |
| `src/components/CollaborativeEditor.tsx` | Monaco + Yjs binding, Vim mode, typing indicator |
| `src/components/FileExplorer.tsx` | Reads/writes the `files` map, ZIP export, delete confirmation |
| `src/components/ExecutionPanel.tsx` | Collapsible console with the Run button and status line |
| `src/components/LanguageSelector.tsx` | The dropdown: 11 runnable languages plus HTML and CSS |
| `src/components/UserList.tsx`, `UserSettings.tsx`, `AuthIdentitySync.tsx` | Presence avatars, name dialog, Clerk → room name sync |
| `src/hooks/useCollaboration.ts` | Creates the `Y.Doc` and `WebsocketProvider`, reports connection status |
| `src/hooks/useCursorBroadcasting.ts`, `useFollowUser.ts` | Awareness publishing and viewport following |
| `src/lib/judge0.ts` | Runtime map, submission creation, polling, result normalisation |
| `src/lib/formatter.ts` | Prettier standalone with the parsers that fit in a browser bundle |
| `src/lib/security.ts` | Origin allowlist and the per-IP rate limiter |
| `src/lib/collaboration.ts` | Shared types for collaborators, editor refs and connection status |
| `src/middleware.ts` | Clerk protection for `/dashboard` and `/room/*`, skipped without keys |
| `server.js` | Yjs relay: `setupWSConnection`, origin logging, dead-socket heartbeat |

## Known gaps

Things that are missing rather than wrong, in rough order of how likely you are to notice:

- Rooms are held in memory in `server.js`. A restart or a Render redeploy empties every room, and
  nothing is recoverable. There's no database in this project to put it in yet.
- There's no test suite and no CI, so `npm run lint`, `npx tsc --noEmit` and clicking around are the
  available safety net.
- File names are flat strings in one map. There are no folders, no rename, and the explorer refuses to
  delete your last file.
- There's no way to pass stdin, so interactive programs get EOF immediately.
- The rate limiter and the WebSocket origin check are both per-instance and advisory, as described
  above.
- C can be executed through the API but not chosen in the dropdown.



