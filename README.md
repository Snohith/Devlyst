# 💻 Devlyst

> **Devlyst** is a real-time collaborative coding environment built for speed, aesthetics, and synchronization. It combines the power of the **Monaco Editor** with instant **WebSocket-based CRDT collaboration (Yjs)**, and cloud code execution through **Judge0**.

---

## 🛠️ Tech Stack & Architecture

- **Web App**: Next.js 16 (App Router) + React 19 + Tailwind CSS + Monaco Editor + Clerk Auth
- **Real-Time Collaboration**: Yjs CRDTs synced by a dedicated WebSocket server ([`server.js`](server.js))
- **Code Execution**: Judge0 Community Edition API through the Next.js route `/api/execute`
- **Backend API (optional)**: Node.js + Express 5 + PostgreSQL (Prisma ORM) for projects and users ([`backend/`](backend))

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

## 🐳 Docker Deployment

To build and run the web app plus the WebSocket server inside Docker:

```bash
# Build the Docker image
docker build -t devlyst .

# Run the container (3000 = Next.js, 1234 = WebSocket)
docker run -p 3000:3000 -p 1234:1234 devlyst
```

To also run PostgreSQL and the optional Express API, use the compose file instead:

```bash
docker compose up --build
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---
*Maintained by [Chiluveru Snohith](https://github.com/Snohith)*
