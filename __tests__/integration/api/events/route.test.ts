// Mock Prisma before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      createMany: jest.fn(),
    },
  },
}))

// Mock auth before imports
jest.mock('@/lib/auth', () => ({
  verifyAuth: jest.fn(),
}))

// Mock payment schedule before imports
jest.mock('@/lib/payment-schedule', () => ({
  calculatePaymentSchedule: jest.fn(() => [
    { type: 'FIRST', amount: 20000, dueDate: new Date(), percentage: 20 },
    { type: 'SECOND', amount: 50000, dueDate: new Date(), percentage: 50 },
    { type: 'FINAL', amount: 30000, dueDate: new Date(), percentage: 30 },
  ]),
}))

import { POST, GET } from '@/app/api/events/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

describe('POST /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should require authentication', async () => {
    const { verifyAuth } = require('@/lib/auth')
    verifyAuth.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        eventName: 'Test Event',
        eventType: 'Wedding',
        eventStartDate: '2024-12-25',
        eventStartTime: '18:00',
        venue: 'Test Venue',
        guestCount: 100,
        budget: 50000,
        contactName: 'John Doe',
        contactPhone: '03001234567',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should create event with authenticated user', async () => {
    const { verifyAuth } = require('@/lib/auth')
    verifyAuth.mockResolvedValue({
      userId: 'user-123',
      role: 'CUSTOMER',
    })

    const mockEvent = {
      id: 'event-123',
      eventName: 'Test Event',
      customerId: 'user-123',
      eventServices: [],
    }

    ;(prisma.service.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.event.create as jest.Mock).mockResolvedValue(mockEvent)
    ;(prisma.payment.createMany as jest.Mock).mockResolvedValue({})

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        eventName: 'Test Event',
        eventType: 'Wedding',
        eventStartDate: '2024-12-25',
        eventStartTime: '18:00',
        venue: 'Test Venue',
        guestCount: 100,
        budget: 50000,
        contactName: 'John Doe',
        contactPhone: '03001234567',
        serviceIds: [],
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    expect(prisma.event.create).toHaveBeenCalled()
  })

  it('should allow event creation without services', async () => {
    const { verifyAuth } = require('@/lib/auth')
    verifyAuth.mockResolvedValue({
      userId: 'user-123',
      role: 'CUSTOMER',
    })

    const mockEvent = {
      id: 'event-123',
      eventName: 'Test Event',
      customerId: 'user-123',
      eventServices: [],
    }

    ;(prisma.service.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.event.create as jest.Mock).mockResolvedValue(mockEvent)
    ;(prisma.payment.createMany as jest.Mock).mockResolvedValue({})

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        eventName: 'Test Event',
        eventType: 'Wedding',
        eventStartDate: '2024-12-25',
        eventStartTime: '18:00',
        venue: 'Test Venue',
        guestCount: 100,
        budget: 50000,
        contactName: 'John Doe',
        contactPhone: '03001234567',
        serviceIds: [],
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})

describe('GET /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should require authentication', async () => {
    const { verifyAuth } = require('@/lib/auth')
    verifyAuth.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/events')
    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('should return only user events for customers', async () => {
    const { verifyAuth } = require('@/lib/auth')
    verifyAuth.mockResolvedValue({
      userId: 'user-123',
      role: 'CUSTOMER',
    })

    const mockEvents = [
      {
        id: 'event-1',
        eventName: 'Event 1',
        customerId: 'user-123',
      },
    ]

    ;(prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents)
    ;(prisma.event.count as jest.Mock).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/events')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.events).toHaveLength(1)
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          customerId: 'user-123',
        }),
      })
    )
  })

  it('should return all events for admins', async () => {
    const { verifyAuth } = require('@/lib/auth')
    verifyAuth.mockResolvedValue({
      userId: 'admin-123',
      role: 'ADMIN',
    })

    const mockEvents = [
      { id: 'event-1', eventName: 'Event 1' },
      { id: 'event-2', eventName: 'Event 2' },
    ]

    ;(prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents)
    ;(prisma.event.count as jest.Mock).mockResolvedValue(2)

    const request = new NextRequest('http://localhost/api/events')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.events).toHaveLength(2)
  })
})

