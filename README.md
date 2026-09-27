# 💻 Devlyst

> **Devlyst** is a real-time collaborative coding environment built for speed, aesthetics, and synchronization. It combines the power of the **Monaco Editor** with instant **WebSocket-based CRDT collaboration (Yjs)**, PostgreSQL persistence via Prisma, and cloud code execution.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vite + React 19 + Tailwind CSS + Monaco Editor + Clerk Auth
- **Backend API**: Node.js + Express 5 + PostgreSQL (Prisma ORM)
- **Real-Time Collaboration**: Dedicated WebSocket Server + Yjs CRDTs
- **Code Execution**: Piston API via server proxy

See [docs/MIGRATION.md](docs/MIGRATION.md) for detailed architecture and running instructions.


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
