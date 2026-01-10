# Deployment Guide for Devlyst

This guide covers acquiring a domain and deploying your Devlyst application to production.

## 1. Buying a Domain

For a developer tool like Devlyst, the following TLDs (extensions) are highly recommended:
*   **.io**: The gold standard for tech startups.
*   **.dev**: Specifically Google-brand for developer tools (requires HTTPS, which is good).
*   **.app**: General purpose application.
*   **.tech**: A cheaper alternative often used for side projects.

### Recommended Registrars
*   **Porkbun**: Very transparent pricing, funny branding, great interface.
*   **Cloudflare**: Sells domains at cost (zero markup), excellent DNS management.
*   **Namecheap**: Good support and frequent sales.

### Suggested Names (Search for availability):
*   `devlyst.io`
*   `devlyst.dev`
*   `devlyst.code`
*   `use-devlyst.com`
*   `getdevlyst.com`

---

## 2. Hosting Your Application

Since Devlyst uses **WebSockets** (persistent connections), "Serverless" functions (like Vercel standard hosting) can sometimes be tricky or expensive for the backend component. We recommend a **Virtual Private Server (VPS)** or a **Docker-native PaaS**.

### Option A: The PaaS Route (Recommended - Render)
We have included a `render.yaml` Blueprint offering the easiest deployment.

1.  **Push your code** to GitHub.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub repository `Devlyst`.
5.  Render will detect `render.yaml` and propose creating two services:
    *   `devlyst-web`: The frontend.
    *   `devlyst-ws`: The WebSocket server.
6.  Click **Apply**.

**Environment Variables Configuration**:
*   Render usually auto-links the variables defined in `render.yaml`.
*   After deployment, ensure `devlyst-web` has the correct `NEXT_PUBLIC_WS_URL` pointing to your `devlyst-ws` service (e.g., `wss://devlyst-ws.onrender.com`).
*   **Important**: For `wss` (secure websockets) to work on Render, the URL scheme must be correct. You might need to manually set `NEXT_PUBLIC_WS_URL` in the frontend service dashboard if the auto-linking sets it to `https`.

### Option B: Railway (Alternative)

### Option B: The VPS Route (Best Performance/Cost - DigitalOcean / Hetzner)
This gives you a full linux server.

**1. Provision a Server**
*   Get a Ubuntu 22.04 Droplet (DigitalOcean) or VPS (Hetzner).
*   ~ $5-10/month.

**2. Point Domain**
*   Go to your Registrar (e.g., Cloudflare).
*   Add an **A Record**: `devlyst.io` -> `YOUR_SERVER_IP`.
*   Add a **CNAME Record**: `www` -> `devlyst.io`.

**3. Server Setup (SSH into your server)**
```bash
# Update and install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
```

**4. Deploy Code**
You can clone your repo directly or use a `docker-compose.yml`.

Create a `docker-compose.yml` file on the server:
```yaml
version: '3'
services:
  devlyst:
    build: .
    ports:
      - "3000:3000"
      - "1234:1234"
    environment:
      - NEXT_PUBLIC_APP_URL=https://devlyst.io
      - NEXT_PUBLIC_WS_PORT=1234
    restart: always
```

**5. Setup Reverse Proxy (Nginx) & SSL**
Install Nginx to handle traffic and SSL.

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Configure Nginx (`/etc/nginx/sites-available/devlyst`):
```nginx
server {
    server_name devlyst.io;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # WebSocket Server
    location /socket {
        # You might need to adjust client code to connect to /socket or keep port 1234 open
        # Ideally, use a subdomain like ws.devlyst.io for the websocket
        proxy_pass http://localhost:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**6. Get SSL Certificate**
```bash
sudo certbot --nginx -d devlyst.io
```

## 3. Post-Deployment Checklist
1.  [ ] **Update Environment Config**: Ensure `NEXT_PUBLIC_APP_URL` in your `.env` matches your new domain `https://devlyst.io`.
2.  [ ] **WebSockets**: If using SSL (`https`), your client MUST connect via `wss://`.
    *   Frontend code automatically handles `ws/wss` switching usually, but double check.
3.  [ ] **Security**: Enable UFW firewall on Ubuntu.
    ```bash
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw enable
    ```
