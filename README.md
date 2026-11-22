# Social Media Downloader Pro

A secure, private, full-stack personal media ingestion and download suite built for YouTube, Instagram, and X (Twitter). Designed for single-tenant deployment on Hostinger Ubuntu VPS alongside existing production sites.

---

## Architecture & Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS with custom glassmorphism design system & neon highlights
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State & Queries:** TanStack React Query + React Hook Form + Zod
- **Data Visualizations:** Recharts
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js (v18+) & Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Security:** Helmet, CORS, Express-Rate-Limit, HttpOnly Cookies, JWT, bcryptjs, SSRF Protection, Path Traversal Guards
- **Media Processing:** FFmpeg integration + child-process yt-dlp wrapper with fallback modes
- **Streaming & SSE:** Server-Sent Events (SSE) for live download progress updates

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure Environment
Copy `server/.env.example` to `server/.env` and fill in your MongoDB Atlas connection string and secrets:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/downloader?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-key
COOKIE_SECRET=your-secure-cookie-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!
```

### 3. Initialize Admin Account
Run the secure server-side command to create your initial admin user:
```bash
npm run create-admin
```

### 4. Run Development Servers
```bash
# Concurrently start frontend (port 5173) and backend (port 5000)
npm run dev
```

Access the application in your browser at: `http://localhost:5173`

---

## Hostinger Ubuntu VPS Non-Destructive Deployment Guide

This project is configured to coexist safely with existing production websites, databases, and PM2 processes on your Hostinger VPS.

### Isolation Rules
1. **Isolated Directory:** Located in `/var/www/social-media-downloader-pro` (never touches existing web directories).
2. **Dedicated Port:** Uses internal port `5000` (or custom port).
3. **Dedicated PM2 App:** Named `sm-downloader-api`.
4. **Dedicated Nginx Virtual Host:** Configure on a subdomain (e.g. `downloader.yourdomain.com`).

### Deployment Steps on VPS:
1. Copy or clone the repository to `/var/www/social-media-downloader-pro`.
2. Configure `server/.env` with production secrets.
3. Install `yt-dlp` and `ffmpeg` on Ubuntu:
   ```bash
   sudo apt update && sudo apt install -y ffmpeg python3-pip
   sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```
4. Run the automated deploy script:
   ```bash
   chmod +x deployment/deploy.sh
   ./deployment/deploy.sh
   ```
5. Set up Nginx virtual host using `deployment/nginx.conf.example`:
   ```bash
   sudo cp deployment/nginx.conf.example /etc/nginx/sites-available/downloader.yourdomain.com
   sudo ln -s /etc/nginx/sites-available/downloader.yourdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
6. Issue SSL certificate via Certbot:
   ```bash
   sudo certbot --nginx -d downloader.yourdomain.com
   ```

---

## Verification & Automated Tests
To run unit and API tests:
```bash
cd server && npm test
```
