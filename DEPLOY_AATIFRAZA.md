# 🚀 Quick Deploy Guide for aatifraza.cloud

## Your Personalized Deployment Steps

Domain: **aatifraza.cloud**
Repository: https://github.com/Aatifraza123/Social-Media-Downloader

---

## ⚡ One-Command Deployment

### Step 1: Connect to Your VPS
```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Download and Run Deployment Script
```bash
curl -o deploy.sh https://raw.githubusercontent.com/Aatifraza123/Social-Media-Downloader/master/deploy.sh && chmod +x deploy.sh && ./deploy.sh
```

**That's it!** The script will automatically:
- Install all dependencies (Node.js, MongoDB, Nginx, FFmpeg, etc.)
- Clone your repository
- Setup backend and frontend
- Configure Nginx for aatifraza.cloud
- Get SSL certificate
- Start the application

---

## 📋 What You Need Before Starting

1. **VPS IP Address** - From your Hostinger panel
2. **SSH Root Password** - For VPS login
3. **Domain DNS Setup** - Configure these records:

### DNS Configuration (In Hostinger Domain Panel)

```
Type    Name    Value           TTL
----    ----    -----           ---
A       @       YOUR_VPS_IP     3600
A       www     YOUR_VPS_IP     3600
```

**Where to set:**
1. Login to Hostinger
2. Go to Domains → aatifraza.cloud → DNS / Name Servers
3. Add/Edit the A records above
4. Wait 5-30 minutes for DNS propagation

**Verify DNS:**
```bash
nslookup aatifraza.cloud
# Should return your VPS IP
```

---

## 🔧 Post-Deployment Configuration

After script completes:

### 1. Update Environment Variables
```bash
nano /var/www/Social-Media-Downloader/server/.env
```

**Update these lines:**
```env
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=generate-with-command-below
FRONTEND_URL=https://aatifraza.cloud
```

**Generate JWT Secret:**
```bash
openssl rand -hex 32
```

### 2. Create Admin User
```bash
cd /var/www/Social-Media-Downloader/server
npm run create-admin
```

### 3. Restart Application
```bash
pm2 restart social-media-downloader-api
```

---

## ✅ Verify Deployment

### 1. Check All Services
```bash
systemctl status mongod    # Should be "active (running)"
systemctl status nginx     # Should be "active (running)"
pm2 status                 # Should show "online"
```

### 2. Test Website
Open browser: **https://aatifraza.cloud**

You should see:
- ✅ Homepage with features showcase
- ✅ Green lock (SSL working)
- ✅ Login page accessible

### 3. Test Login
1. Go to: https://aatifraza.cloud/login
2. Username: `admin`
3. Password: (what you set in .env)

### 4. Test Download
Try downloading from:
- YouTube: Any video URL
- Instagram: Any post/reel URL
- Twitter: Any video URL
- TikTok: Any video URL

---

## 📊 Useful Commands

### View Application Logs
```bash
pm2 logs social-media-downloader-api
```

### Monitor Resources
```bash
pm2 monit
```

### Restart Services
```bash
# Restart application
pm2 restart social-media-downloader-api

# Reload Nginx
systemctl reload nginx

# Restart MongoDB
systemctl restart mongod
```

### Check Disk Usage
```bash
df -h
du -sh /var/www/Social-Media-Downloader/server/storage/downloads
```

### Update yt-dlp (If downloads fail)
```bash
pip3 install -U yt-dlp
```

---

## 🔄 Update Application (Future Updates)

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

---

## 🛡️ Security Checklist

After deployment:
- [ ] Changed admin password in .env
- [ ] Generated new JWT_SECRET
- [ ] SSL certificate installed (HTTPS working)
- [ ] Firewall enabled (ufw status)
- [ ] All services running
- [ ] Can login to admin dashboard
- [ ] Downloads working from all platforms

---

## 🌐 Your URLs

After deployment, these will be live:

- **Homepage:** https://aatifraza.cloud
- **Login:** https://aatifraza.cloud/login
- **Dashboard:** https://aatifraza.cloud/dashboard
- **Downloader:** https://aatifraza.cloud/downloader
- **History:** https://aatifraza.cloud/history
- **API:** https://aatifraza.cloud/api
- **Health Check:** https://aatifraza.cloud/api/health

---

## 🎯 Application Features

Your site will support:

### Platforms:
- ✅ YouTube (videos, playlists, subtitles)
- ✅ Instagram (posts, reels)
- ✅ Twitter/X (videos, media)
- ✅ TikTok (videos)

### Features:
- ✅ Playlist Download (YouTube)
- ✅ Subtitle Download (all languages, SRT/VTT)
- ✅ Auto-Retry (3 attempts on failure)
- ✅ Quality Selection (8K to 144p)
- ✅ File Size Preview
- ✅ Download History
- ✅ Dark/Light Theme
- ✅ Automatic Cleanup (24 hours)

---

## 🆘 Troubleshooting

### Website Not Loading
```bash
# Check Nginx
systemctl status nginx
curl http://localhost

# Check firewall
ufw status
```

### Application Not Working
```bash
# Check logs
pm2 logs social-media-downloader-api --lines 50

# Restart
pm2 restart social-media-downloader-api
```

### Downloads Failing
```bash
# Update yt-dlp
pip3 install -U yt-dlp

# Check FFmpeg
ffmpeg -version

# Check storage permissions
ls -la /var/www/Social-Media-Downloader/server/storage
```

### SSL Certificate Issues
```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew --force-renewal
```

---

## 📞 Support

For detailed guides, see:
- **DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
- **VPS_COMMANDS.md** - Command reference
- **PRODUCTION_CHECKLIST.md** - Pre-launch checklist

---

## 🎉 Success!

Once deployed, your Social Media Downloader will be live at:

**🌐 https://aatifraza.cloud**

With full support for downloading from YouTube, Instagram, Twitter/X, and TikTok!

---

## 📝 Quick Reference

```bash
# Connect to VPS
ssh root@YOUR_VPS_IP

# View logs
pm2 logs

# Check status
pm2 status
systemctl status mongod nginx

# Restart app
pm2 restart social-media-downloader-api

# Update yt-dlp
pip3 install -U yt-dlp

# Check disk space
df -h
```

---

**Deployment Script Already Configured for:** aatifraza.cloud ✅

Just run the deployment script and your site will be live! 🚀
