#!/usr/bin/env node

/**
 * Build verification script
 * Checks that the production build completed successfully
 */

const fs = require('fs')
const path = require('path')

const errors = []

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next')
if (!fs.existsSync(nextDir)) {
  errors.push('❌ .next directory not found. Build may have failed.')
} else {
  console.log('✅ .next directory exists')
}

// Check if static files exist
const staticDir = path.join(nextDir, 'static')
if (!fs.existsSync(staticDir)) {
  errors.push('❌ Static files not found. Build may be incomplete.')
} else {
  console.log('✅ Static files generated')
}

// Check if server files exist
const serverDir = path.join(nextDir, 'server')
if (!fs.existsSync(serverDir)) {
  errors.push('❌ Server files not found. Build may be incomplete.')
} else {
  console.log('✅ Server files generated')
}

// Check environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`)
  console.warn('   These should be set in your hosting platform')
} else {
  console.log('✅ Required environment variables are set')
}

// Summary
if (errors.length > 0) {
  console.error('\n❌ Build verification failed:')
  errors.forEach(error => console.error(`   ${error}`))
  process.exit(1)
} else {
  console.log('\n✅ Build verification passed!')
  console.log('   Your application is ready for deployment.')
  process.exit(0)
}

