# PWA Icons

The following icon files are needed for PWA support:

## Required Icons:
- `icon-192x192.png` - Standard app icon
- `icon-512x512.png` - High-res app icon
- `apple-touch-icon.png` (180x180) - iOS home screen icon
- `favicon.ico` - Browser favicon

## How to Generate:

### Option 1: Use Online Tool (Recommended)
1. Visit https://realfavicongenerator.net/
2. Upload your `logo.svg` file
3. Configure settings:
   - iOS: Enable, use solid background color (#000000)
   - Android: Enable, use theme color (#8b5cf6)
   - Windows: Enable
4. Download the generated package
5. Extract files to `/public` directory

### Option 2: Manual Generation
Use an image editor to create:
- 192x192px PNG (transparent or #000000 background)
- 512x512px PNG (transparent or #000000 background)
- 180x180px PNG for Apple (solid #000000 background)
- 32x32px ICO for favicon

## Current Status:
⚠️ **Placeholder icons needed** - App will work but won't have proper icons until generated.

The PWA will still function without these files, but users won't see proper icons when installing the app.
