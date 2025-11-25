// Mock environment variables before importing
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long-for-testing'
process.env.JWT_EXPIRES_IN = '7d'

import { generateToken, verifyToken, getTokenFromRequest } from '@/lib/jwt'
import type { JWTPayload } from '@/lib/jwt'

describe('generateToken', () => {
  const payload: JWTPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    phone: '03001234567',
    name: 'Test User',
    role: 'CUSTOMER',
  }

  it('should generate a valid token', () => {
    const token = generateToken(payload)
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
  })

  it('should generate different tokens for different payloads', () => {
    const token1 = generateToken(payload)
    const payload2 = { ...payload, userId: 'user-456' }
    const token2 = generateToken(payload2)
    expect(token1).not.toBe(token2)
  })
})

describe('verifyToken', () => {
  const payload: JWTPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    phone: '03001234567',
    name: 'Test User',
    role: 'CUSTOMER',
  }

  it('should verify a valid token', () => {
    const token = generateToken(payload)
    const decoded = verifyToken(token)
    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.email).toBe(payload.email)
    expect(decoded.role).toBe(payload.role)
  })

  it('should throw error for invalid token', () => {
    const invalidToken = 'invalid.token.here'
    expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token')
  })

  it('should throw error for tampered token', () => {
    const token = generateToken(payload)
    const tamperedToken = token.slice(0, -5) + 'xxxxx'
    expect(() => verifyToken(tamperedToken)).toThrow()
  })
})

describe('getTokenFromRequest', () => {
  it('should extract token from Bearer authorization header', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'authorization') return 'Bearer test-token-123'
          return null
        },
      },
    } as any
    const token = getTokenFromRequest(request)
    expect(token).toBe('test-token-123')
  })

  it('should return null if no authorization header', () => {
    const request = {
      headers: {
        get: (name: string) => null,
      },
    } as any
    const token = getTokenFromRequest(request)
    expect(token).toBeNull()
  })

  it('should return null if authorization header does not start with Bearer', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'authorization') return 'Basic test-token-123'
          return null
        },
      },
    } as any
    const token = getTokenFromRequest(request)
    expect(token).toBeNull()
  })

  it('should handle authorization header with extra spaces', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'authorization') return 'Bearer  test-token-123'
          return null
        },
      },
    } as any
    const token = getTokenFromRequest(request)
    expect(token).toBe(' test-token-123')
  })
})
