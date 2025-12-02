# Favicon Setup Guide

This guide explains how to set up favicons for your Choice Menu website.

## Quick Start

1. **Place your logo image** in the `public/` folder:
   - Name it `logo.png` (or `logo.jpg`, `logo.jpeg`, `logo.svg`)
   - Recommended size: 512x512 pixels or larger (square image works best)

2. **Install the required dependency:**
   ```bash
   npm install sharp --save-dev
   ```

3. **Generate all favicon files:**
   ```bash
   npm run favicon:generate
   ```
   
   Or specify a custom logo path:
   ```bash
   node scripts/generate-favicons.js path/to/your/logo.png
   ```

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

5. **Clear browser cache** if the old favicon is still showing (Ctrl+Shift+R or Cmd+Shift+R)

## Generated Files

The script will create the following files in the `public/` folder:

- ✅ `favicon.ico` - Main favicon (32x32)
- ✅ `favicon-16x16.png` - 16x16 PNG favicon
- ✅ `favicon-32x32.png` - 32x32 PNG favicon
- ✅ `favicon-48x48.png` - 48x48 PNG favicon
- ✅ `favicon-64x64.png` - 64x64 PNG favicon
- ✅ `apple-touch-icon.png` - 180x180 for iOS devices
- ✅ `site.webmanifest` - Web app manifest (already created)

## Configuration

The favicon links are already configured in `app/layout.tsx`:

```typescript
icons: {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
  ],
  apple: [
    { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  ],
  shortcut: "/favicon.ico",
},
manifest: "/site.webmanifest",
```

## Browser Compatibility

✅ **Chrome/Edge** - Uses favicon.ico and PNG favicons
✅ **Firefox** - Uses favicon.ico and PNG favicons
✅ **Safari** - Uses apple-touch-icon.png and PNG favicons
✅ **Mobile browsers** - Uses apple-touch-icon.png

## Troubleshooting

### Favicon not showing?

1. **Clear browser cache:**
   - Chrome/Edge: Ctrl+Shift+Delete → Clear cached images
   - Firefox: Ctrl+Shift+Delete → Cache
   - Safari: Cmd+Option+E

2. **Hard refresh:**
   - Windows/Linux: Ctrl+Shift+R
   - Mac: Cmd+Shift+R

3. **Check file paths:**
   - Ensure all favicon files are in the `public/` folder
   - Verify file names match exactly (case-sensitive)

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Error: "sharp package is required"

Install sharp:
```bash
npm install sharp --save-dev
```

### Logo image not found

Make sure your logo file is in one of these locations:
- `public/logo.png`
- `public/logo.jpg`
- `public/logo.jpeg`
- `public/logo.svg`

Or specify the path:
```bash
node scripts/generate-favicons.js path/to/your/logo.png
```

## Manual Generation (Alternative)

If you prefer to generate favicons manually:

1. Use an online favicon generator:
   - [Favicon.io](https://favicon.io/)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon Generator](https://www.favicon-generator.org/)

2. Download the generated files

3. Place them in the `public/` folder

4. Ensure `site.webmanifest` is updated with correct paths

## Files Created/Modified

### Created Files:
- ✅ `scripts/generate-favicons.js` - Favicon generation script
- ✅ `public/site.webmanifest` - Web app manifest
- ✅ `FAVICON_SETUP.md` - This guide

### Modified Files:
- ✅ `app/layout.tsx` - Added comprehensive favicon configuration
- ✅ `package.json` - Added `favicon:generate` script and `sharp` dependency

---

**Next Steps:**
1. Place your logo image in `public/logo.png`
2. Run `npm install sharp --save-dev`
3. Run `npm run favicon:generate`
4. Restart your dev server
5. Check the browser tab - your logo should appear! 🎉

