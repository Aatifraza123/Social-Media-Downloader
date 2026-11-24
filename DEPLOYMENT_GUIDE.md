# 🚀 Deployment Guide - Hostinger VPS

This guide will help you deploy the Social Media Downloader Pro application to your Hostinger VPS.

## 📋 Prerequisites

- Hostinger VPS with Ubuntu/Debian
- Domain name configured
- SSH access to VPS
- Root or sudo access

## 🛠️ Server Requirements

- Node.js 18+ 
- MongoDB 6+
- Nginx (web server)
- PM2 (process manager)
- FFmpeg (for video processing)
- Python 3.8+ (for yt-dlp)

---

## 📦 Step 1: Initial VPS Setup

### 1.1 Connect to your VPS
```bash
ssh root@your-vps-ip
```

### 1.2 Update system packages
```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # Verify installation
npm -v
```

### 1.4 Install MongoDB
```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
systemctl status mongod
```

### 1.5 Install FFmpeg
```bash
apt install -y ffmpeg
ffmpeg -version
```

### 1.6 Install Python and yt-dlp
```bash
apt install -y python3 python3-pip
pip3 install -U yt-dlp
yt-dlp --version
```

### 1.7 Install PM2 (Process Manager)
```bash
npm install -g pm2
pm2 --version
```

### 1.8 Install Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## 🔧 Step 2: Clone and Setup Application

### 2.1 Create application directory
```bash
mkdir -p /var/www
cd /var/www
```

### 2.2 Clone repository
```bash
git clone https://github.com/Aatifraza123/Social-Media-Downloader.git
cd Social-Media-Downloader
```

### 2.3 Setup Backend
```bash
cd server

# Install dependencies
npm install --production

# Create storage directories
mkdir -p storage/downloads
mkdir -p storage/temp
mkdir -p logs

# Set permissions
chmod 755 storage
chmod 755 storage/downloads
chmod 755 storage/temp
```

### 2.4 Configure Backend Environment
```bash
# Create production .env file
nano .env
```

Add this configuration:
```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/social-media-downloader

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# File Storage
STORAGE_PATH=./storage
MAX_FILE_SIZE=524288000
FILE_RETENTION_HOURS=24
CLEANUP_SCHEDULE=0 */6 * * *

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS (your domain)
FRONTEND_URL=https://yourdomain.com

# Optional: Cloudinary (for cloud storage)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

**Important**: Replace `yourdomain.com` with your actual domain!

### 2.5 Build Frontend
```bash
cd /var/www/Social-Media-Downloader/client

# Install dependencies
npm install

# Update API URL for production
nano src/services/api.js
```

Update the baseURL:
```javascript
const API_BASE_URL = 'https://yourdomain.com/api';  // Change this to your domain
```

```bash
# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

---

## 🌐 Step 3: Configure Nginx

### 3.1 Create Nginx configuration
```bash
nano /etc/nginx/sites-available/social-media-downloader
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend - Serve React build
    location / {
        root /var/www/Social-Media-Downloader/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for large downloads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Download files
    location /downloads {
        alias /var/www/Social-Media-Downloader/server/storage/downloads;
        
        # Security - prevent directory listing
        autoindex off;
        
        # Large file support
        client_max_body_size 500M;
    }

    # Logs
    access_log /var/log/nginx/social-media-downloader-access.log;
    error_log /var/log/nginx/social-media-downloader-error.log;
}
```

**Replace `yourdomain.com` with your actual domain!**

### 3.2 Enable site and test configuration
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/social-media-downloader /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

---

## 🔒 Step 4: Setup SSL with Let's Encrypt (Free HTTPS)

### 4.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 4.2 Get SSL certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

Certbot will automatically:
- Get SSL certificate
- Update Nginx config
- Setup auto-renewal

### 4.3 Test auto-renewal
```bash
certbot renew --dry-run
```

---

## 🚀 Step 5: Start Application with PM2

### 5.1 Start backend server
```bash
cd /var/www/Social-Media-Downloader/server

# Start with PM2
pm2 start server.js --name social-media-downloader-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command it outputs
```

### 5.2 Monitor application
```bash
# View logs
pm2 logs social-media-downloader-api

# Check status
pm2 status

# Monitor resources
pm2 monit
```

---

## 🔍 Step 6: Create Admin User

```bash
cd /var/www/Social-Media-Downloader/server
npm run create-admin
```

This will create an admin user with credentials from your `.env` file.

---

## ✅ Step 7: Verify Deployment

### 7.1 Check all services
```bash
# MongoDB
systemctl status mongod

# Nginx
systemctl status nginx

# Backend API
pm2 status

# Check logs
pm2 logs social-media-downloader-api --lines 50
```

### 7.2 Test application
1. Open browser: `https://yourdomain.com`
2. Login with admin credentials
3. Test download from YouTube/Instagram/Twitter/TikTok
4. Check download history
5. Test playlist download

---

## 🔄 Step 8: Update Application (Future Updates)

```bash
cd /var/www/Social-Media-Downloader

# Pull latest changes
git pull origin master

# Update backend
cd server
npm install --production
pm2 restart social-media-downloader-api

# Update frontend
cd ../client
npm install
npm run build

# Reload Nginx
systemctl reload nginx
```

---

## 📊 Monitoring & Maintenance

### View Application Logs
```bash
# PM2 logs
pm2 logs social-media-downloader-api

# Nginx logs
tail -f /var/log/nginx/social-media-downloader-access.log
tail -f /var/log/nginx/social-media-downloader-error.log
```

### Check Disk Usage
```bash
# Check storage folder
du -sh /var/www/Social-Media-Downloader/server/storage/downloads

# Cleanup runs automatically every 6 hours
# Manual cleanup if needed:
cd /var/www/Social-Media-Downloader/server
# Use admin API endpoint or run cleanup manually
```

### Database Backup
```bash
# Create backup
mongodump --db social-media-downloader --out /backup/mongodb/$(date +%Y%m%d)

# Restore if needed
mongorestore --db social-media-downloader /backup/mongodb/YYYYMMDD/social-media-downloader
```

---

## 🛡️ Security Checklist

- ✅ Change default admin password
- ✅ Use strong JWT_SECRET
- ✅ Enable firewall (UFW)
- ✅ Keep system updated
- ✅ Monitor logs regularly
- ✅ Setup automated backups
- ✅ Use HTTPS only
- ✅ Restrict MongoDB access

### Setup Firewall
```bash
# Enable UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## ⚠️ Troubleshooting

### Backend not starting
```bash
pm2 logs social-media-downloader-api
# Check for MongoDB connection errors
systemctl status mongod
```

### Downloads failing
```bash
# Check yt-dlp
yt-dlp --update

# Check FFmpeg
ffmpeg -version

# Check storage permissions
ls -la /var/www/Social-Media-Downloader/server/storage
```

### High memory usage
```bash
# Monitor with PM2
pm2 monit

# Restart if needed
pm2 restart social-media-downloader-api
```

### SSL certificate issues
```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew --force-renewal
```

---

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs`
- GitHub Issues: https://github.com/Aatifraza123/Social-Media-Downloader/issues
- Server logs: `/var/log/nginx/`

---

## 🎉 Success!

Your Social Media Downloader Pro is now live at: **https://yourdomain.com**

**Features Available:**
- ✅ YouTube, Instagram, Twitter/X, TikTok downloads
- ✅ Playlist downloads with progress tracking
- ✅ Subtitle downloads (all languages)
- ✅ Auto-retry on failures
- ✅ Automatic storage cleanup
- ✅ Download history
- ✅ Dark/Light theme
- ✅ Quality selection
- ✅ File size preview

**Admin Dashboard:** `https://yourdomain.com/dashboard`
