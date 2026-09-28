# 💻 Devlyst

> **Devlyst** is a real-time collaborative coding environment built for speed, aesthetics, and synchronization. It combines the power of the **Monaco Editor** with instant **WebSocket-based CRDT collaboration (Yjs)**, and cloud code execution through **Judge0**.

---

## 🛠️ Tech Stack & Architecture

- **Web App**: Next.js 16 (App Router) + React 19 + Tailwind CSS + Monaco Editor + Clerk Auth
- **Real-Time Collaboration**: Yjs CRDTs synced by a dedicated WebSocket server ([`server.js`](server.js))
- **Code Execution**: Judge0 Community Edition API through the Next.js route `/api/execute`

See [docs/MIGRATION.md](docs/MIGRATION.md) for detailed architecture and running instructions.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v20.0.0` or higher
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

### 4. Start the WebSocket Server
Real-time collaboration needs the Yjs server on port 1234:
```bash
node server.js
```

### 5. Run the Development Server
In a second terminal:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---
*Maintained by [Chiluveru Snohith](https://github.com/Snohith)*
