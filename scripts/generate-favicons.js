#!/usr/bin/env node

/**
 * Favicon Generator Script
 * Generates all required favicon sizes from a source logo image
 * 
 * Usage: node scripts/generate-favicons.js [source-image-path]
 * Example: node scripts/generate-favicons.js public/logo.png
 * 
 * Requirements: sharp package (npm install sharp)
 */

const fs = require('fs')
const path = require('path')

// Check if sharp is available
let sharp
try {
  sharp = require('sharp')
} catch (error) {
  console.error('❌ Error: sharp package is required to generate favicons')
  console.error('   Install it with: npm install sharp --save-dev')
  process.exit(1)
}

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-64x64.png', size: 64 },
  { name: 'apple-touch-icon.png', size: 180 },
]

// Try to find source logo
const possibleSources = [
  process.argv[2], // Command line argument
  'public/logo.png',
  'public/logo.jpg',
  'public/logo.jpeg',
  'public/logo.svg',
]

let sourceImage = null
for (const source of possibleSources) {
  if (source && fs.existsSync(source)) {
    sourceImage = source
    break
  }
}

if (!sourceImage) {
  console.error('❌ Error: No source logo image found!')
  console.error('   Please provide a logo image at one of these locations:')
  possibleSources.slice(1).forEach(src => console.error(`   - ${src}`))
  console.error('   Or specify the path: node scripts/generate-favicons.js path/to/logo.png')
  process.exit(1)
}

const publicDir = path.join(process.cwd(), 'public')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

console.log(`📸 Generating favicons from: ${sourceImage}`)
console.log(`📁 Output directory: ${publicDir}\n`)

async function generateFavicons() {
  try {
    // Generate PNG favicons
    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name)
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath)
      console.log(`✅ Generated: ${name} (${size}x${size})`)
    }

    // Generate favicon.ico (16x16 and 32x32 combined)
    // Note: This is a simplified version. For a proper .ico file, you might need a specialized library
    // For now, we'll create a 32x32 PNG and rename it (browsers will accept it)
    const icoPath = path.join(publicDir, 'favicon.ico')
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '.png'))
    
    // Copy the 32x32 PNG as favicon.ico (browsers will handle it)
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      icoPath
    )
    console.log(`✅ Generated: favicon.ico`)

    console.log('\n✨ All favicons generated successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. The favicon links are already configured in app/layout.tsx')
    console.log('   2. Restart your development server to see the favicon')
    console.log('   3. Clear browser cache if the old favicon is still showing')
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message)
    process.exit(1)
  }
}

generateFavicons()

