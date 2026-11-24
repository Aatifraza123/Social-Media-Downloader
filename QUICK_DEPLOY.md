# ⚡ Quick Deployment Guide - Hostinger VPS

## 🎯 1-Minute Setup

### Option A: Automated Script (Recommended)

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Download and run deployment script
curl -o deploy.sh https://raw.githubusercontent.com/Aatifraza123/Social-Media-Downloader/master/deploy.sh
chmod +x deploy.sh

# 3. Edit script with your domain
nano deploy.sh
# Change: DOMAIN="yourdomain.com"

# 4. Run deployment
./deploy.sh
```

### Option B: Manual Quick Setup

```bash
# 1. Connect to VPS
ssh root@your-vps-ip

# 2. Install dependencies
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx mongodb-org ffmpeg python3-pip
pip3 install -U yt-dlp
npm install -g pm2

# 3. Clone project
cd /var/www
git clone https://github.com/Aatifraza123/Social-Media-Downloader.git
cd Social-Media-Downloader

# 4. Setup backend
cd server
npm install --production
cp .env.example .env
nano .env  # Edit with your settings

# 5. Build frontend
cd ../client
nano src/services/api.js  # Update API URL
npm install
npm run build

# 6. Configure Nginx
# (Copy nginx config from DEPLOYMENT_GUIDE.md)
nano /etc/nginx/sites-available/social-media-downloader
ln -s /etc/nginx/sites-available/social-media-downloader /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 7. Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 8. Start application
cd /var/www/Social-Media-Downloader/server
pm2 start server.js --name social-media-downloader-api
pm2 save
pm2 startup

# 9. Create admin user
npm run create-admin
```

## ✅ Verify Installation

```bash
# Check services
systemctl status mongod
systemctl status nginx
pm2 status

# View logs
pm2 logs social-media-downloader-api

# Test site
curl https://yourdomain.com
```

## 🔄 Update Application

```bash
cd /var/www/Social-Media-Downloader
git pull origin master

# Update backend
cd server
npm install --production
pm2 restart social-media-downloader-api

# Update frontend
cd ../client
npm install
npm run build
systemctl reload nginx
```

## 📞 Need Help?

See full guide: `DEPLOYMENT_GUIDE.md`

## 🎉 Done!

Your site is live at: **https://yourdomain.com**
