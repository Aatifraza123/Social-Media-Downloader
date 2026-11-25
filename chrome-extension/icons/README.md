# Extension Icons

You need to create 3 PNG icon files:

1. **icon16.png** - 16x16 pixels (used in extension toolbar)
2. **icon48.png** - 48x48 pixels (used in extensions management page)
3. **icon128.png** - 128x128 pixels (used in Chrome Web Store)

## How to Create Icons

### Option 1: Use Canva (Easy)
1. Go to https://www.canva.com
2. Create custom size: 128x128px
3. Add download icon (⬇) or your logo
4. Use gradient background (purple/blue)
5. Download as PNG
6. Resize to 48x48 and 16x16 using online tools

### Option 2: Use Figma (Professional)
1. Create 128x128 frame
2. Design your icon with download symbol
3. Export as PNG @1x, @0.375x (48px), @0.125x (16px)

### Option 3: Use IconGenerator.net
1. Upload a simple logo/image
2. Generate all icon sizes automatically
3. Download and place in this folder

### Option 4: Quick SVG to PNG
Use this simple download icon SVG and convert to PNG:

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <path d="M64 32v48m0 0l-16-16m16 16l16-16M32 72v16a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8V72" 
        stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Convert this SVG to PNG at:
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

## Temporary Solution

For testing, you can use any 3 PNG images named icon16.png, icon48.png, and icon128.png.

The extension will work without proper icons, but you won't be able to publish to Chrome Web Store without them.
