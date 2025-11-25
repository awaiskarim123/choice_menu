// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long'
process.env.JWT_EXPIRES_IN = '7d'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Polyfill for Response (required by Next.js API routes)
if (typeof global.Response === 'undefined') {
  // Use undici's Response if available, otherwise create a simple mock
  try {
    const { Response } = require('undici')
    global.Response = Response
  } catch {
    global.Response = class Response {
      constructor(body, init = {}) {
        this._body = body
        this.status = init.status || 200
        this.statusText = init.statusText || 'OK'
        this.headers = new Map(Object.entries(init.headers || {}))
        this.ok = this.status >= 200 && this.status < 300
      }
      async json() {
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
      }
      async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
      }
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

