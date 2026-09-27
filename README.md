# 💻 Devlyst

[![Next.js 15](https://img.shields.io/badge/Next.js-15%20%28App%20Router%29-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-VS%20Code%20Engine-1E1E1E?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.style=for-the-badge.svg)](LICENSE)

> **Devlyst** is a premium, real-time collaborative coding environment built for speed, aesthetics, and synchronization. It combines the power of the **Monaco Editor** with instant **WebSocket-based CRDT collaboration (Yjs)** and cloud code execution.

---

## ✨ Key Features

- ⚡ **Real-Time Synchronization**: Powered by **Yjs** and **WebSockets**. Edits, file creation, and cursor movements sync instantly across all room members.
- 📝 **Production-Grade Code Editor**: Monaco Editor integration (the engine behind VS Code) complete with syntax highlighting, auto-completion, minimap, and multi-file tabs.
- 🚀 **Cloud Code Execution**: Run code securely in multiple programming languages (JavaScript, Python, Go, Rust, C++) via Piston API integration.
- 👥 **Live Presence & Custom Usernames**: See who is active with custom display names, live avatars, and color-coded remote cursors.
- 🔑 **Smart Room Sharing**: Generate and join collaborative coding rooms using simple 5-digit room codes.
- 🎨 **Dark Mode & Glassmorphism UI**: Crafted with Framer Motion and Tailwind CSS for smooth micro-animations and a clutter-free experience.
- 📁 **Multi-File Workspace**: Create, rename, edit, and delete multiple code files within a single active session.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Real-Time Sync** | Yjs, WebSockets (`y-websocket`) |
| **Code Execution** | Piston Code Execution API |
| **Monitoring & DevOps** | Sentry, Docker |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/Snohith/Devlyst.git
cd Devlyst
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To build and run Devlyst inside Docker:

```bash
# Build the Docker image
docker build -t devlyst .

# Run the container
docker run -p 3000:3000 devlyst
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---
*Maintained by [Chiluveru Snohith](https://github.com/Snohith)*
