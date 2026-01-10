# Devlyst

**Devlyst** is a premium, real-time collaborative coding environment built with the latest web technologies.

## 🚀 Features

*   **Real-time Collaboration**: Powered by Yjs and WebSockets for seamless multi-user editing.
*   **Professional Editor**: Integrated Monaco Editor (VS Code core) for a familiar coding experience.
*   **File Management**: Create, edit, rename, and delete files with a robust file system structure.
*   **Modern UI**: Glassmorphic aesthetics, smooth animations, and a responsive design using Tailwind CSS.
*   **Terminal Integration**: Built-in terminal simulation for command execution (frontend-simulated or backend-connected).

## 🛠️ Technology Stack

*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion.
*   **Backend**: Node.js custom server (`server.js`) for WebSocket coordination.
*   **State/Sync**: Yjs, y-websocket, y-monaco.

## 🏃‍♂️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    # Terminal 1: Next.js Frontend
    npm run dev

    # Terminal 2: WebSocket Server
    node server.js
    ```
    *Open [http://localhost:3000](http://localhost:3000) with your browser.*

## 🚢 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed instructions on hosting Devlyst on a VPS or PaaS like Railway/Render.
