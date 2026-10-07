# Devlyst

A collaborative code editor that runs in the browser. You open a room, send the link to whoever
you're working with, and everyone types into the same Monaco editor. There's a synced file tree, a
format button, Vim keybindings if you want them, presence cursors with names, a "follow this
person" mode, and a Run button that ships the current file to a sandbox and prints whatever comes
back.

Two processes and no database:

```
  browser ─────────────► Next.js app (src/)  ──POST /api/execute──►  Judge0 CE
     │                        │
     └── WebSocket (Yjs) ─────┘──► server.js   (rooms live in memory)
```

- `src/` — the Next.js app: pages, components, hooks, and the one API route.
- `server.js` — a small Yjs WebSocket relay (about 70 lines) that passes document updates between
  everyone in a room. It is a protocol relay, not an application backend: no accounts, no auth checks,
  no business logic, no stored records.
- `render.yaml` — a Render blueprint that deploys both.

Rooms aren't stored anywhere. A room's document exists in the memory of the WebSocket server for
as long as someone is connected to it. Restart that server, or let the last person leave, and the
room is gone. That's on purpose: it keeps self-hosting down to two processes and no Postgres.

## What you can actually do

- **Edit together.** Every room is a Yjs document. Text changes, the file tree, and cursors all
  arrive over one WebSocket connection.
- **Keep more than one file.** The explorer reads a `files` map in the shared document, so creating
  or deleting a file happens for everyone at once. New rooms start with `main.js`. You can also
  export the whole room as a ZIP.
- **Switch languages.** The dropdown lists the 12 runnable languages plus HTML and CSS. Switching it
  renames the current file to the matching extension, and opening a file whose extension is known
  switches the language back. HTML and CSS are editable and exportable but can't be run.
- **Run the current file.** The result, exit code and timing show up in the console panel under the
  editor. Up to 20 runs per minute per IP, 100 KB of source per run.
- **Format.** `Shift+Alt+F` or the wand button, powered by Prettier's standalone build. Works for
  JavaScript, TypeScript, JSON, HTML, CSS, Markdown and YAML. Other languages are left alone.
- **See who else is around.** Avatars with random colours, a typing indicator, and click an avatar
  to follow that person's cursor until you click again.
- **Turn on Vim mode.** Toggle in the toolbar, with a mode line at the bottom of the editor.
- **Sign in, or don't.** Clerk is optional. With keys configured you get accounts and the
  dashboard/room pages are protected; without keys those pages are open and you pick a display name
  that's kept in `localStorage`.
- **Install it.** It's a PWA, so Chromium browsers offer to install it as a standalone app.

## Running it locally

You need Node.js 20 or newer, and two terminals — the app and the collaboration server are
separate processes.

```bash
git clone https://github.com/Snohith/Devlyst.git
cd Devlyst
npm install
cp .env.example .env.local        # optional, the defaults work as-is
```

```bash
# terminal 1 - collaboration server
node server.js                    # ws://localhost:1234

# terminal 2 - web app
npm run dev                       # http://localhost:3000
```

Open http://localhost:3000, head to the dashboard, and create a room. Open the same room URL in a
second browser window to watch the sync happen.

Only Clerk keys are worth setting up early, and only if you want sign-in. Without them the app
still runs; the sign-in button becomes a "Sign In (Dev)" link and the dashboard greets you as
"Anonymous" until you set a name in Settings.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server on port 3000 (webpack) |
| `npm run build` | Production build, which also regenerates the service worker |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, using `eslint.config.mjs` |
| `node server.js` | The Yjs WebSocket server on `PORT` (default 1234) |

There's no test suite yet. `npm run lint` and `npx tsc --noEmit` are the checks that exist.

## Where things live

```
src/app/            routes - landing pages, /dashboard, /room/[roomId], /api/execute
src/components/     the room UI (editor, file tree, console, presence) plus landing-page pieces
src/hooks/          useCollaboration, useCursorBroadcasting, useFollowUser
src/lib/            Judge0 client, Prettier wrapper, security helpers, shared types
src/middleware.ts   Clerk route protection
server.js           Yjs WebSocket relay
render.yaml         two-service Render blueprint
docs/               deeper notes, see below
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the pieces talk to each other: the shared
  document, presence, the execution pipeline, and where the security checks live.
- [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md) — every environment variable, deploying on Render or
  your own host, and what to check when something breaks.

## License

MIT. See [LICENSE](LICENSE).

Maintained by [Chiluveru Snohith](https://github.com/Snohith).
