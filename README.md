# 🎬 Social Media Downloader Pro

A powerful, full-featured social media content downloader supporting YouTube, Instagram, Twitter/X, and TikTok. Built with React and Node.js, featuring playlist downloads, subtitle support, auto-retry, and automatic storage management.

**Live Demo:** [Your Domain Here]  
**Repository:** https://github.com/Aatifraza123/Social-Media-Downloader

---

## ✨ Features

### 🎥 Platform Support
- **YouTube** - Videos, playlists, and subtitles
- **Instagram** - Posts and reels
- **Twitter/X** - Videos and media
- **TikTok** - Videos with watermark options

### 🚀 Advanced Features
- **Playlist Download** - Download entire YouTube playlists with real-time progress
- **Subtitle Download** - All available languages in SRT/VTT formats
- **Auto-Retry** - 3 automatic retry attempts with exponential backoff
- **Quality Selection** - Choose from 8K to 144p video quality or audio-only
- **File Size Preview** - See file sizes before downloading
- **Automatic Cleanup** - Files automatically deleted after 24 hours
- **Download History** - Track all your downloads
- **Dark/Light Theme** - User preference support
- **Batch Downloads** - Queue multiple downloads

### 🛡️ Security & Performance
- JWT authentication with HttpOnly cookies
- Rate limiting and SSRF protection
- Helmet security headers
- MongoDB for data persistence
- PM2 process management
- Nginx reverse proxy ready

---

## 🚀 Quick Deploy to VPS

### One-Line Installation
```bash
curl -o deploy.sh https://raw.githubusercontent.com/Aatifraza123/Social-Media-Downloader/master/deploy.sh && chmod +x deploy.sh && nano deploy.sh && ./deploy.sh
```

**Before running:** Edit `deploy.sh` and change `DOMAIN="yourdomain.com"` to your domain!

### What Gets Installed
- Node.js 20.x
- MongoDB 7.0
- Nginx web server
- PM2 process manager
- FFmpeg for video processing
- Python + yt-dlp
- SSL certificate (Let's Encrypt)

### Full Documentation
- 📖 **[Complete Deployment Guide](DEPLOYMENT_GUIDE.md)** - Step-by-step instructions
- ⚡ **[Quick Deploy Guide](QUICK_DEPLOY.md)** - Fast setup
- 📋 **[Production Checklist](PRODUCTION_CHECKLIST.md)** - Pre-launch verification
- 💻 **[VPS Commands](VPS_COMMANDS.md)** - Quick reference

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- FFmpeg
- Python 3.8+ with yt-dlp

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Aatifraza123/Social-Media-Downloader.git
cd Social-Media-Downloader

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install

# 4. Setup environment variables
cd ../server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
nano .env
```

### Configuration

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-media-downloader
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Run Development Servers

```bash
# Terminal 1 - Backend (from server folder)
npm run dev

# Terminal 2 - Frontend (from client folder)
npm run dev
```

Access: `http://localhost:5173`

### Create Admin User

```bash
cd server
npm run create-admin
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** TanStack React Query + Context API
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet, CORS, Rate Limiting, SSRF Protection
- **Video Processing:** FFmpeg + yt-dlp
- **Scheduling:** node-cron
- **Process Management:** PM2

---

## 📂 Project Structure

```
Social-Media-Downloader/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── hooks/           # Custom hooks
│   └── dist/                # Production build
│
├── server/                   # Node.js backend
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   │   └── platforms/      # Platform-specific services
│   ├── jobs/               # Scheduled jobs
│   ├── storage/            # Downloaded files
│   └── logs/               # Application logs
│
├── DEPLOYMENT_GUIDE.md      # Complete deployment guide
├── QUICK_DEPLOY.md         # Quick start guide
├── deploy.sh               # Automated deployment script
├── nginx.conf              # Nginx configuration
└── ecosystem.config.js     # PM2 configuration
```

---

## 🔧 Configuration

### Environment Variables

**Server (`server/.env`):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-media-downloader
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
FRONTEND_URL=https://yourdomain.com
FILE_RETENTION_HOURS=24
CLEANUP_SCHEDULE=0 */6 * * *
```

**Client (`client/.env.production`):**
```env
VITE_API_URL=/api
VITE_APP_NAME=Social Media Downloader Pro
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Media
- `POST /api/media/analyze` - Analyze URL
- `POST /api/media/download` - Download media
- `POST /api/media/batch` - Batch download

### Playlists
- `POST /api/playlists/analyze` - Analyze playlist
- `POST /api/playlists/download` - Download playlist
- `GET /api/playlists/:id` - Get playlist info
- `GET /api/playlists/:id/progress` - Real-time progress (SSE)

### Subtitles
- `POST /api/subtitles/list` - List available subtitles
- `POST /api/subtitles/download` - Download subtitle
- `POST /api/subtitles/download-all` - Download all subtitles

### Downloads
- `GET /api/downloads` - Get download history
- `GET /api/downloads/:id` - Get download details
- `GET /api/downloads/:id/file` - Download file
- `POST /api/downloads/:id/retry` - Retry failed download
- `DELETE /api/downloads/:id` - Delete download

---

## 🔄 Updating

### Pull Latest Changes
```bash
cd /var/www/Social-Media-Downloader
git pull origin master
```

### Update Backend
```bash
cd server
npm install --production
pm2 restart social-media-downloader-api
```

### Update Frontend
```bash
cd ../client
npm install
npm run build
systemctl reload nginx
```

---

## 🛠️ Maintenance

### View Logs
```bash
# Application logs
pm2 logs social-media-downloader-api

# Nginx logs
tail -f /var/log/nginx/social-media-downloader-access.log
tail -f /var/log/nginx/social-media-downloader-error.log
```

### Monitor Resources
```bash
pm2 monit
```

### Database Backup
```bash
mongodump --db social-media-downloader --out /backup/mongodb/$(date +%Y%m%d)
```

### Manual Cleanup
```bash
# Remove files older than 24 hours
find /var/www/Social-Media-Downloader/server/storage/downloads -type f -mtime +1 -delete
```

---

## 🐛 Troubleshooting

### Application Not Starting
```bash
pm2 logs social-media-downloader-api
systemctl status mongod
```

### Downloads Failing
```bash
# Update yt-dlp
pip3 install -U yt-dlp

# Check FFmpeg
ffmpeg -version

# Check permissions
ls -la /var/www/Social-Media-Downloader/server/storage
```

### Website Not Accessible
```bash
systemctl status nginx
nginx -t
ufw status
```

---

## 📊 Performance

- **Concurrent Downloads:** 5 simultaneous downloads
- **Max File Size:** 500MB (configurable)
- **Download Timeout:** 10 minutes
- **Cleanup Schedule:** Every 6 hours
- **File Retention:** 24 hours

---

## 🔒 Security Features

- JWT authentication with HttpOnly cookies
- Password hashing with bcryptjs
- Rate limiting (100 requests per 15 minutes)
- SSRF protection for URLs
- Path traversal prevention
- Nginx security headers
- SSL/TLS encryption
- Input validation with Zod
- MongoDB injection prevention

---

## 📝 License

This project is for personal/educational use.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📞 Support

- **Documentation:** See deployment guides in repository
- **Issues:** GitHub Issues
- **Email:** support@yourdomain.com

---

## 🎯 Roadmap

- [ ] Video trimming/cutting
- [ ] Format conversion
- [ ] Batch URL import
- [ ] Download scheduling
- [ ] User accounts & quotas
- [ ] Cloud storage integration
- [ ] Mobile app
- [ ] Browser extension

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ for the community**
