# Social Media Downloader Pro - Chrome Extension

Download videos and images from Instagram, YouTube, and Twitter with one click!

## Features

✅ **In-Page Download Buttons** - Download buttons appear directly on posts
✅ **Right-Click Menu** - Alternative download option via context menu
✅ **Multiple Quality Options** - Choose from various video/audio qualities
✅ **Multiple Formats** - MP4, MP3, JPG, ZIP support
✅ **Fast & Secure** - Direct connection to your backend API
✅ **Clean UI** - Beautiful modal with preview and format selection

## Supported Platforms

- **Instagram**: Posts, Reels, IGTV, Carousels (images as ZIP)
- **YouTube**: Videos, Shorts (4K, 1080p, 720p, etc.)
- **Twitter/X**: Video tweets and threads

## Installation

### Method 1: Load Unpacked (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. The extension is now installed!

### Method 2: Create ZIP and Load

```bash
cd chrome-extension
zip -r social-media-downloader-extension.zip .
```

Then load the ZIP file in Chrome extensions.

## Usage

### Method 1: In-Page Button
1. Visit Instagram, YouTube, or Twitter
2. Look for the **download icon** (⬇) on posts/videos
3. Click the button
4. Select quality/format from the modal
5. File downloads automatically!

### Method 2: Right-Click Menu
1. Right-click on any Instagram/YouTube/Twitter post or video
2. Select **"Download with Social Media Downloader"**
3. Choose quality/format
4. Download starts!

## Configuration

The extension connects to your backend API at:
```
https://aatifraza.cloud/api
```

To change the API URL, edit `background.js`:
```javascript
const API_BASE_URL = 'https://your-domain.com/api';
```

## File Structure

```
chrome-extension/
├── manifest.json              # Extension manifest (v3)
├── background.js              # Service worker (context menu, API)
├── content-instagram.js       # Instagram script
├── content-youtube.js         # YouTube script
├── content-twitter.js         # Twitter/X script
├── styles.css                 # Shared styles
├── popup.html                 # Extension popup UI
├── icons/                     # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md                  # This file
```

## Creating Icons

You need to create 3 icon sizes in the `icons/` folder:
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px  
- `icon128.png` - 128x128px

Use a logo or download icon with your brand colors.

## Publishing to Chrome Web Store

1. Create icons (required)
2. Test thoroughly in developer mode
3. Create a ZIP of the extension folder
4. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
5. Pay one-time $5 developer fee
6. Upload ZIP and fill in store listing details
7. Submit for review

## Permissions Explained

- `contextMenus` - For right-click download option
- `activeTab` - To inject download buttons on current page
- `storage` - To save user preferences (future use)
- `host_permissions` - Access to Instagram, YouTube, Twitter domains

## Troubleshooting

**Download button not appearing:**
- Refresh the page after installing extension
- Check if you're on a supported URL (post/video page)
- Open Console (F12) and check for errors

**Downloads failing:**
- Check if backend API is running at `https://aatifraza.cloud`
- Check browser console for API errors
- Verify Instagram cookies are valid on backend

**Modal not opening:**
- Disable other download extensions that might conflict
- Clear browser cache and reload
- Check console for JavaScript errors

## Development

To modify the extension:

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click **Reload** button on your extension
4. Test the changes

## Support

For issues or questions:
- GitHub: [Your Repo URL]
- Website: https://aatifraza.cloud
- Email: [Your Email]

## License

MIT License - Free to use and modify

## Changelog

### Version 1.0.0 (2026-11-25)
- Initial release
- Instagram, YouTube, Twitter support
- In-page buttons + context menu
- Multiple quality options
- Beautiful modal UI
