# Devlyst

**Devlyst** is a premium, real-time collaborative coding environment built for speed, aesthetics, and synchronization. It combines the power of the Monaco Editor with instant WebSocket-based collaboration.

![Devlyst Preview](public/logo.svg)

## 🚀 Key Features

*   **Real-time Synchronization**: Powered by **Yjs** and **WebSockets**, file edits and cursor movements are synced instantly across all users.
*   **Production-Grade Editor**: Fully integrated **Monaco Editor** (the core of VS Code) with syntax highlighting, minimap, and IntelliSense.
*   **Code Execution**: Run code securely in the cloud (supporting multiple languages like JS, Python, Go, Rust, etc.) via Piston API integration.
*   **User Identity**:
    *   **Custom Usernames**: Set your display name via the Dashboard settings (persisted via LocalStorage).
    *   **Live Presence**: See who is online with named avatars and colored cursors.
*   **Smart Rooms**:
    *   **5-Digit Room IDs**: easy-to-share numeric codes for quick joining.
    *   **Dashboard**: A sleek hub to create new rooms or join existing ones.
*   **Modern Aesthetics**: A "Dark Mode First" design featuring glassmorphism, smooth transitions (Framer Motion), and a clutter-free interface.
*   **File System**: Create, rename, delete, and switch between multiple files in a session.

## 🛠️ Technology Stack

*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
*   **Editor**: Monaco Editor (`@monaco-editor/react`).
*   **Collaboration**: Yjs ecosystem (`yjs`, `y-websocket`, `y-monaco`).
*   **Backend**: Node.js WebSocket Server (Custom implementation for granular control).
*   **Icons**: Lucide React.

## 🏃‍♂️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file (see `.env.example`) or use defaults.

3.  **Run Locally**:
    ```bash
    # This runs both the Next.js frontend and the WebSocket server concurrently
    npm run dev:all 
    # OR run them separately:
    # Terminal 1: npm run dev
    # Terminal 2: node server.js
    ```
    *Open [http://localhost:3000](http://localhost:3000) with your browser.*

## 🚢 Deployment

Devlyst is optimized for deployment on **Render** using a Blueprints architecture (splitting Frontend and WebSocket functionality into communicating services).

See **[DEPLOY.md](./DEPLOY.md)** for a step-by-step production deployment guide.

---
*Built with ❤️ by Snohith*
