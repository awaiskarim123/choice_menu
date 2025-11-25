// Mock Prisma before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock auth before imports
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn((password) => Promise.resolve(`hashed-${password}`)),
  verifyAuth: jest.fn(() => Promise.resolve(null)),
}))

import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user successfully', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
      role: 'CUSTOMER',
    }

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        password: 'password123',
        cnic: '12345-1234567-1',
        role: 'CUSTOMER',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User created successfully')
    expect(data.user).toMatchObject({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    })
    expect(prisma.user.create).toHaveBeenCalled()
  })

  it('should reject duplicate email', async () => {
    const existingUser = {
      id: 'existing-user',
      email: 'john@example.com',
      phone: '03001234567',
    }

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(existingUser)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        password: 'password123',
        role: 'CUSTOMER',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('already exists')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should reject invalid CNIC format', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        password: 'password123',
        cnic: '12345-123456-1', // Invalid format
        role: 'CUSTOMER',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
  })

  it('should allow registration without CNIC', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
      role: 'CUSTOMER',
    }

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        password: 'password123',
        role: 'CUSTOMER',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
