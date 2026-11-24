# 🔒 Production Deployment Checklist

Before going live, ensure all items are checked:

## 🔐 Security

- [ ] Change `ADMIN_PASSWORD` in `.env` to a strong password
- [ ] Generate new `JWT_SECRET` (use: `openssl rand -hex 32`)
- [ ] Update `FRONTEND_URL` in `.env` to your actual domain
- [ ] Enable firewall (UFW) on VPS
- [ ] Install SSL certificate with Let's Encrypt
- [ ] Remove or protect `.env` file (never commit to git)
- [ ] Set proper file permissions on server
- [ ] Enable Nginx security headers
- [ ] Configure rate limiting properly
- [ ] Review and update CORS settings

## 🗄️ Database

- [ ] MongoDB is running and accessible
- [ ] Database connection string is correct in `.env`
- [ ] Database is secured (not publicly accessible)
- [ ] Setup automated database backups
- [ ] Create admin user: `npm run create-admin`

## 🌐 Frontend

- [ ] Update API URL in `client/src/services/api.js` (should be relative `/api`)
- [ ] Build frontend: `npm run build`
- [ ] Verify build output in `client/dist/`
- [ ] Test all routes work with Nginx
- [ ] Check responsive design on mobile
- [ ] Verify dark/light theme works

## ⚙️ Backend

- [ ] All dependencies installed: `npm install --production`
- [ ] Environment variables configured in `.env`
- [ ] Storage directories exist and have correct permissions
- [ ] FFmpeg is installed and working
- [ ] yt-dlp is installed and updated
- [ ] PM2 is managing the process
- [ ] Application starts without errors
- [ ] Logs are being written correctly

## 🌍 Web Server (Nginx)

- [ ] Nginx is installed and running
- [ ] Configuration file is in `/etc/nginx/sites-available/`
- [ ] Symbolic link created in `/etc/nginx/sites-enabled/`
- [ ] Nginx configuration tested: `nginx -t`
- [ ] SSL certificate installed (Certbot)
- [ ] HTTP redirects to HTTPS
- [ ] Static files are served correctly
- [ ] API proxy is working
- [ ] Download endpoint is accessible
- [ ] Gzip compression is enabled

## 🚀 Deployment

- [ ] Application is running via PM2
- [ ] PM2 configured for auto-restart
- [ ] PM2 startup script configured
- [ ] All services start on system reboot
- [ ] Application logs are accessible
- [ ] Error handling is working
- [ ] Cleanup job is scheduled

## 📊 Monitoring

- [ ] PM2 monitoring dashboard: `pm2 monit`
- [ ] Check logs regularly: `pm2 logs`
- [ ] Monitor disk usage for storage folder
- [ ] Monitor MongoDB performance
- [ ] Setup alerts for high memory/CPU usage
- [ ] Monitor SSL certificate expiration

## 🧪 Testing

- [ ] Homepage loads correctly
- [ ] Login works with admin credentials
- [ ] YouTube download works
- [ ] Instagram download works
- [ ] Twitter/X download works
- [ ] TikTok download works
- [ ] Playlist download works
- [ ] Subtitle download works
- [ ] Download history displays correctly
- [ ] File cleanup runs as scheduled
- [ ] Error messages display properly
- [ ] Mobile view works correctly

## 📝 Domain & DNS

- [ ] Domain points to VPS IP address
- [ ] DNS A record configured for root domain
- [ ] DNS A record configured for www subdomain
- [ ] DNS propagation complete (check: `nslookup yourdomain.com`)
- [ ] Domain accessible via browser

## 🔄 Backup & Recovery

- [ ] Database backup script created
- [ ] Automated backups scheduled
- [ ] Backup restoration tested
- [ ] Code repository is on GitHub
- [ ] `.env` file backed up securely (not in git)
- [ ] Recovery procedure documented

## 📈 Performance

- [ ] Gzip compression enabled
- [ ] Static assets cached properly
- [ ] API response times acceptable
- [ ] Download speeds adequate
- [ ] Memory usage within limits
- [ ] CPU usage within limits
- [ ] Disk space monitored

## 📄 Documentation

- [ ] README.md updated
- [ ] API documentation available
- [ ] Deployment guide followed
- [ ] Admin credentials stored securely
- [ ] Support contact information available

## 🎯 Final Steps

1. **Verify all services:**
   ```bash
   systemctl status mongod
   systemctl status nginx
   pm2 status
   ```

2. **Check application logs:**
   ```bash
   pm2 logs social-media-downloader-api --lines 50
   tail -f /var/log/nginx/social-media-downloader-error.log
   ```

3. **Test website:**
   - Open: `https://yourdomain.com`
   - Login as admin
   - Download test video from each platform
   - Check download history
   - Try playlist download

4. **Monitor for 24 hours:**
   - Watch logs for errors
   - Check cleanup job runs correctly
   - Monitor resource usage
   - Test from different devices

## ✅ Launch Ready!

Once all items are checked, your application is ready for production use!

---

## 🆘 Troubleshooting

### Application not accessible
- Check if PM2 process is running: `pm2 status`
- Check Nginx status: `systemctl status nginx`
- View error logs: `pm2 logs`

### Downloads failing
- Check yt-dlp: `yt-dlp --version`
- Update yt-dlp: `pip3 install -U yt-dlp`
- Check FFmpeg: `ffmpeg -version`
- Check storage permissions: `ls -la server/storage`

### SSL issues
- Check certificate: `certbot certificates`
- Renew manually: `certbot renew`
- Check Nginx SSL config

### Database connection errors
- Check MongoDB: `systemctl status mongod`
- Check connection string in `.env`
- View MongoDB logs: `journalctl -u mongod`

---

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs`
2. Review Nginx logs: `/var/log/nginx/`
3. Check system resources: `htop`
4. Restart services if needed
5. GitHub Issues: https://github.com/Aatifraza123/Social-Media-Downloader/issues
