# Chrome Extension Installation Guide

## Quick Start (Without Icons - For Testing)

### Step 1: Create Temporary Icons

```powershell
# Windows PowerShell mein ye commands run karo
cd "social-media-downloader-pro/chrome-extension/icons"

# Any 3 PNG images ko copy karke rename karo
# Ya online se koi download icon download karo
```

**Quick icon source:** 
- Download from: https://icons8.com/icons/set/download (search "download")
- Save as icon16.png, icon48.png, icon128.png in `icons/` folder

---

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Method 1: Type `chrome://extensions/` in address bar
   - Method 2: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle the switch in top-right corner

3. **Load Unpacked Extension:**
   - Click "Load unpacked" button
   - Navigate to: `social-media-downloader-pro/chrome-extension`
   - Select the folder and click "Select Folder"

4. **Extension Installed!** ✅
   - You'll see "Social Media Downloader Pro" in your extensions list
   - Extension icon appears in Chrome toolbar

---

### Step 3: Test the Extension

#### Test on Instagram:
1. Open https://www.instagram.com/p/DgKD8Mmysts/ (or any post)
2. Look for download button (⬇) near like/comment buttons
3. Click it → Modal opens with quality options
4. Select format → Download starts!

#### Test on YouTube:
1. Open any YouTube video
2. Look for "Download" button next to Like/Share buttons
3. Click → Choose quality → Download!

#### Test on Twitter/X:
1. Open any tweet with video
2. Download button appears with other actions
3. Click → Select quality → Download!

#### Test Right-Click Menu:
1. Right-click on any Instagram/YouTube/Twitter post
2. Select "Download with Social Media Downloader"
3. Modal opens → Choose format → Download!

---

## Troubleshooting

### ❌ "Manifest file is missing or unreadable"
**Fix:** Make sure you selected the `chrome-extension` folder, not the parent folder.

### ❌ Icons showing as blank
**Fix:** Create placeholder icons (any 3 PNG files):
```powershell
# Use any image and copy 3 times
copy sample.png icon16.png
copy sample.png icon48.png  
copy sample.png icon128.png
```

### ❌ Download button not appearing
**Fix:** 
- Refresh the page after installing extension
- Open Console (F12) → Check for errors
- Make sure you're on a post/video page

### ❌ "Failed to analyze media"
**Fix:**
- Check if https://aatifraza.cloud is accessible
- Backend API must be running
- Check Network tab in DevTools for API errors

### ❌ Instagram downloads failing
**Fix:**
- Ensure Instagram cookies are uploaded on backend
- Check backend logs: `pm2 logs social-media-downloader-api`

---

## Update Extension After Code Changes

1. Edit extension files (`.js`, `.css`, `.html`)
2. Go to `chrome://extensions/`
3. Click **Reload** button (🔄) on your extension
4. Test the changes

---

## Uninstall Extension

1. Go to `chrome://extensions/`
2. Find "Social Media Downloader Pro"
3. Click **Remove**
4. Confirm deletion

---

## Next Steps

### 1. Create Proper Icons
- Follow instructions in `icons/README.md`
- Use Canva/Figma to design branded icons
- Replace placeholder icons

### 2. Test on All Platforms
- [ ] Instagram posts (single image)
- [ ] Instagram carousels (multiple images)
- [ ] Instagram reels
- [ ] YouTube videos (various qualities)
- [ ] YouTube Shorts
- [ ] Twitter videos
- [ ] Right-click menu on all platforms

### 3. Customize
- Change API URL in `background.js` if needed
- Modify button styles in `styles.css`
- Update extension name/description in `manifest.json`

### 4. Publish to Chrome Web Store (Optional)
- Create all 3 icon sizes properly
- Test thoroughly
- Create Chrome Web Store developer account ($5 fee)
- Upload extension ZIP
- Fill in store listing
- Submit for review

---

## Features Summary

✅ **Instagram**
- In-page download buttons on posts/reels
- Support for images (JPG), videos (MP4), carousels (ZIP)
- Quality selector modal

✅ **YouTube**
- Download button next to Like/Share
- Multiple quality options (4K, 1080p, 720p, etc.)
- MP4 and MP3 formats

✅ **Twitter/X**  
- Download buttons on video tweets
- Quality selection
- Works on both twitter.com and x.com

✅ **Right-Click Menu**
- Works on all supported platforms
- Alternative to in-page buttons

✅ **Beautiful UI**
- Preview thumbnail
- File size display
- Loading states
- Success/error messages

---

## Support

**Issues?** Check:
1. Browser console (F12) for errors
2. Backend logs: `pm2 logs social-media-downloader-api`
3. Network tab for API request failures

**Backend not running?**
```bash
ssh razaa@aatifraza.cloud
pm2 restart social-media-downloader-api
pm2 logs social-media-downloader-api
```
