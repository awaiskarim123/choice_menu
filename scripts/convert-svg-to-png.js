#!/usr/bin/env node

/**
 * Convert SVG logo to PNG
 * Creates a high-quality PNG version of the logo for use in the website
 */

const fs = require('fs')
const path = require('path')

let sharp
try {
  sharp = require('sharp')
} catch (error) {
  console.error('❌ Error: sharp package is required')
  console.error('   Install it with: npm install sharp --save-dev')
  process.exit(1)
}

const svgPath = path.join(process.cwd(), 'public', 'logo.svg')
const pngPath = path.join(process.cwd(), 'public', 'logo.png')

if (!fs.existsSync(svgPath)) {
  console.error('❌ Error: logo.svg not found at:', svgPath)
  process.exit(1)
}

async function convertSvgToPng() {
  try {
    // Create a high-quality PNG (512x512 for best quality)
    await sharp(svgPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(pngPath)
    
    console.log('✅ Successfully converted logo.svg to logo.png')
    console.log(`📁 Output: ${pngPath}`)
    console.log('📏 Size: 512x512 pixels')
    console.log('\n✨ The logo component will now use the PNG image!')
    
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error.message)
    process.exit(1)
  }
}

convertSvgToPng()

