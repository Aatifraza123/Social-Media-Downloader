# 🎯 VPS Quick Reference Commands

## 🔌 SSH Connection

```bash
# Connect to VPS
ssh root@YOUR_VPS_IP

# Or with custom port
ssh -p PORT root@YOUR_VPS_IP
```

## 🚀 One-Line Deployment

```bash
# Download and run deployment script
curl -o deploy.sh https://raw.githubusercontent.com/Aatifraza123/Social-Media-Downloader/master/deploy.sh && chmod +x deploy.sh && nano deploy.sh && ./deploy.sh
```

**Before running:** Edit `deploy.sh` and change `DOMAIN="yourdomain.com"` to your actual domain!

---

## 📋 Service Management

### MongoDB
```bash
# Status
systemctl status mongod

# Start/Stop/Restart
systemctl start mongod
systemctl stop mongod
systemctl restart mongod

# View logs
journalctl -u mongod -f
```

### Nginx
```bash
# Status
systemctl status nginx

# Start/Stop/Restart
systemctl start nginx
systemctl stop nginx
systemctl restart nginx

# Reload config (no downtime)
systemctl reload nginx

# Test configuration
nginx -t

# View logs
tail -f /var/log/nginx/social-media-downloader-access.log
tail -f /var/log/nginx/social-media-downloader-error.log
```

### Application (PM2)
```bash
# Status
pm2 status

# Start
pm2 start server.js --name social-media-downloader-api

# Stop/Restart
pm2 stop social-media-downloader-api
pm2 restart social-media-downloader-api

# Delete
pm2 delete social-media-downloader-api

# View logs
pm2 logs social-media-downloader-api

# View last 100 lines
pm2 logs social-media-downloader-api --lines 100

# Monitor resources
pm2 monit

# Save configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

---

## 🔄 Update Application

```bash
# Navigate to app directory
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

# Verify
pm2 status
curl https://yourdomain.com
```

---

## 🔧 Configuration Files

### Edit Environment
```bash
nano /var/www/Social-Media-Downloader/server/.env
```

### Edit Nginx Config
```bash
nano /etc/nginx/sites-available/social-media-downloader
nginx -t
systemctl reload nginx
```

### Edit PM2 Config
```bash
nano /var/www/Social-Media-Downloader/ecosystem.config.js
pm2 restart social-media-downloader-api
```

---

## 🔒 SSL Management

### Get Certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Renew Certificate
```bash
# Dry run (test)
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

### Check Certificates
```bash
certbot certificates
```

### Auto-renewal (should be automatic)
```bash
systemctl status certbot.timer
```

---

## 🗄️ Database Management

### MongoDB Shell
```bash
mongosh

# Switch to database
use social-media-downloader

# Show collections
show collections

# Count documents
db.downloads.countDocuments()
db.users.countDocuments()

# Find all downloads
db.downloads.find().pretty()

# Exit
exit
```

### Database Backup
```bash
# Create backup
mongodump --db social-media-downloader --out /backup/mongodb/$(date +%Y%m%d)

# Restore backup
mongorestore --db social-media-downloader /backup/mongodb/YYYYMMDD/social-media-downloader
```

### Create Admin User
```bash
cd /var/www/Social-Media-Downloader/server
npm run create-admin
```

---

## 📊 Monitoring

### Check Disk Space
```bash
# Overall disk usage
df -h

# Storage folder size
du -sh /var/www/Social-Media-Downloader/server/storage/downloads

# Check largest files
du -ah /var/www/Social-Media-Downloader/server/storage/downloads | sort -rh | head -20
```

### Check Memory Usage
```bash
free -h
```

### Check CPU Usage
```bash
top
# or
htop  # (install: apt install htop)
```

### View Process Details
```bash
ps aux | grep node
```

### Network Status
```bash
# Check ports
netstat -tulpn | grep LISTEN

# Or with ss
ss -tulpn | grep LISTEN
```

---

## 🧹 Cleanup

### Manual Storage Cleanup
```bash
# Remove old downloads (older than 24 hours)
find /var/www/Social-Media-Downloader/server/storage/downloads -type f -mtime +1 -delete

# Or specific files
rm /var/www/Social-Media-Downloader/server/storage/downloads/FILENAME
```

### Clear PM2 Logs
```bash
pm2 flush
```

### Clear Nginx Logs
```bash
truncate -s 0 /var/log/nginx/social-media-downloader-access.log
truncate -s 0 /var/log/nginx/social-media-downloader-error.log
```

### System Cleanup
```bash
# Remove old packages
apt autoremove -y

# Clean apt cache
apt clean
```

---

## 🛡️ Firewall (UFW)

### Status
```bash
ufw status
```

### Enable/Disable
```bash
ufw enable
ufw disable
```

### Allow Services
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
```

### Delete Rules
```bash
ufw status numbered
ufw delete NUMBER
```

---

## 🔍 Troubleshooting

### Application Not Working
```bash
# 1. Check if PM2 process is running
pm2 status

# 2. Check application logs
pm2 logs social-media-downloader-api --lines 100

# 3. Check if port 5000 is listening
netstat -tulpn | grep 5000

# 4. Restart application
pm2 restart social-media-downloader-api
```

### Nginx Not Working
```bash
# 1. Check Nginx status
systemctl status nginx

# 2. Test configuration
nginx -t

# 3. Check error logs
tail -50 /var/log/nginx/error.log

# 4. Restart Nginx
systemctl restart nginx
```

### MongoDB Not Working
```bash
# 1. Check status
systemctl status mongod

# 2. View logs
journalctl -u mongod -n 50

# 3. Restart
systemctl restart mongod
```

### Downloads Failing
```bash
# 1. Update yt-dlp
pip3 install -U yt-dlp

# 2. Check FFmpeg
ffmpeg -version

# 3. Check storage permissions
ls -la /var/www/Social-Media-Downloader/server/storage

# 4. Check disk space
df -h
```

### High Memory Usage
```bash
# 1. Check memory
free -h

# 2. Check which process is using memory
ps aux --sort=-%mem | head

# 3. Restart application
pm2 restart social-media-downloader-api

# 4. Consider increasing server resources
```

---

## 📦 Package Updates

### Update System
```bash
apt update && apt upgrade -y
```

### Update Node.js
```bash
# Check current version
node -v

# Update to latest LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Update yt-dlp
```bash
pip3 install -U yt-dlp
yt-dlp --version
```

### Update PM2
```bash
npm install -g pm2@latest
pm2 update
```

---

## 🔐 Security

### Change Admin Password
```bash
nano /var/www/Social-Media-Downloader/server/.env
# Update ADMIN_PASSWORD
pm2 restart social-media-downloader-api
```

### Generate New JWT Secret
```bash
openssl rand -hex 32
# Copy output to .env JWT_SECRET
```

### Check Open Ports
```bash
nmap localhost
```

### View Failed Login Attempts
```bash
grep "Failed password" /var/log/auth.log
```

---

## 📱 Quick Tests

### Test Application
```bash
# Health check
curl https://yourdomain.com

# API test
curl https://yourdomain.com/api/health

# Backend directly
curl http://localhost:5000/api/health
```

### Test Services
```bash
# All services at once
systemctl status mongod nginx && pm2 status
```

---

## 💾 Backup Commands

### Full Backup
```bash
# Create backup directory
mkdir -p /backup/$(date +%Y%m%d)

# Backup database
mongodump --db social-media-downloader --out /backup/$(date +%Y%m%d)/db

# Backup code
cp -r /var/www/Social-Media-Downloader /backup/$(date +%Y%m%d)/code

# Backup .env (securely!)
cp /var/www/Social-Media-Downloader/server/.env /backup/$(date +%Y%m%d)/env.backup

# Backup Nginx config
cp /etc/nginx/sites-available/social-media-downloader /backup/$(date +%Y%m%d)/nginx.conf
```

---

## 🆘 Emergency Commands

### Restart Everything
```bash
systemctl restart mongod nginx && pm2 restart all
```

### Kill All Node Processes (Use with caution!)
```bash
pkill -f node
pm2 resurrect
```

### Emergency Stop
```bash
pm2 stop all
systemctl stop nginx
```

---

## 📞 Get Help

```bash
# System information
uname -a
lsb_release -a
free -h
df -h

# Application status
pm2 status
systemctl status nginx
systemctl status mongod
```

Copy this output when asking for support!
