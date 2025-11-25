import { 
  loginSchema, 
  registerSchema, 
  eventBookingSchema, 
  serviceSchema,
  updateEventStatusSchema,
  paymentUpdateSchema 
} from '@/lib/validations'

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    }
    expect(() => loginSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    }
    expect(() => loginSchema.parse(invalidData)).toThrow()
  })

  it('should reject short password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '12345',
    }
    expect(() => loginSchema.parse(invalidData)).toThrow()
  })
})

describe('registerSchema', () => {
  it('should validate correct registration data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
      password: 'password123',
      cnic: '12345-1234567-1',
      role: 'CUSTOMER' as const,
    }
    expect(() => registerSchema.parse(validData)).not.toThrow()
  })

  it('should validate CNIC format correctly', () => {
    const validCNIC = {
      name: 'John Doe',
      phone: '03001234567',
      password: 'password123',
      cnic: '71544-3333345-4',
    }
    expect(() => registerSchema.parse(validCNIC)).not.toThrow()
  })

  it('should reject invalid CNIC format', () => {
    const invalidCNIC = {
      name: 'John Doe',
      phone: '03001234567',
      password: 'password123',
      cnic: '12345-123456-1', // Wrong format
    }
    expect(() => registerSchema.parse(invalidCNIC)).toThrow()
  })

  it('should allow optional CNIC', () => {
    const dataWithoutCNIC = {
      name: 'John Doe',
      phone: '03001234567',
      password: 'password123',
    }
    expect(() => registerSchema.parse(dataWithoutCNIC)).not.toThrow()
  })

  it('should reject short name', () => {
    const invalidData = {
      name: 'J',
      phone: '03001234567',
      password: 'password123',
    }
    expect(() => registerSchema.parse(invalidData)).toThrow()
  })

  it('should reject short phone number', () => {
    const invalidData = {
      name: 'John Doe',
      phone: '123',
      password: 'password123',
    }
    expect(() => registerSchema.parse(invalidData)).toThrow()
  })
})

describe('eventBookingSchema', () => {
  it('should validate correct event booking data', () => {
    const validData = {
      eventName: 'Wedding Reception',
      eventType: 'Wedding',
      eventStartDate: '2024-12-25',
      eventStartTime: '18:00',
      venue: 'Grand Hall',
      guestCount: 100,
      budget: 50000,
      contactName: 'John Doe',
      contactPhone: '03001234567',
      serviceIds: ['service-id-1'],
    }
    expect(() => eventBookingSchema.parse(validData)).not.toThrow()
  })

  it('should allow optional serviceIds', () => {
    const dataWithoutServices = {
      eventName: 'Wedding Reception',
      eventType: 'Wedding',
      eventStartDate: '2024-12-25',
      eventStartTime: '18:00',
      venue: 'Grand Hall',
      guestCount: 100,
      budget: 50000,
      contactName: 'John Doe',
      contactPhone: '03001234567',
    }
    expect(() => eventBookingSchema.parse(dataWithoutServices)).not.toThrow()
  })

  it('should reject short event name', () => {
    const invalidData = {
      eventName: 'AB',
      eventType: 'Wedding',
      eventStartDate: '2024-12-25',
      eventStartTime: '18:00',
      venue: 'Grand Hall',
      guestCount: 100,
      budget: 50000,
      contactName: 'John Doe',
      contactPhone: '03001234567',
    }
    expect(() => eventBookingSchema.parse(invalidData)).toThrow()
  })

  it('should reject negative budget', () => {
    const invalidData = {
      eventName: 'Wedding Reception',
      eventType: 'Wedding',
      eventStartDate: '2024-12-25',
      eventStartTime: '18:00',
      venue: 'Grand Hall',
      guestCount: 100,
      budget: -1000,
      contactName: 'John Doe',
      contactPhone: '03001234567',
    }
    expect(() => eventBookingSchema.parse(invalidData)).toThrow()
  })
})

describe('serviceSchema', () => {
  it('should validate correct service data', () => {
    const validData = {
      name: 'Catering Service',
      description: 'Full catering service',
      price: 50000,
      isActive: true,
    }
    expect(() => serviceSchema.parse(validData)).not.toThrow()
  })

  it('should reject short service name', () => {
    const invalidData = {
      name: 'A',
      price: 50000,
    }
    expect(() => serviceSchema.parse(invalidData)).toThrow()
  })

  it('should reject negative price', () => {
    const invalidData = {
      name: 'Catering Service',
      price: -1000,
    }
    expect(() => serviceSchema.parse(invalidData)).toThrow()
  })
})

describe('updateEventStatusSchema', () => {
  it('should validate correct status update', () => {
    const validData = {
      status: 'CONFIRMED' as const,
    }
    expect(() => updateEventStatusSchema.parse(validData)).not.toThrow()
  })

  it('should validate status with cancellation reason', () => {
    const validData = {
      status: 'CANCELLED' as const,
      cancellationReason: 'Client request',
    }
    expect(() => updateEventStatusSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid status', () => {
    const invalidData = {
      status: 'INVALID_STATUS' as any,
    }
    expect(() => updateEventStatusSchema.parse(invalidData)).toThrow()
  })
})

describe('paymentUpdateSchema', () => {
  it('should validate correct payment update', () => {
    const validData = {
      status: 'PAID' as const,
      paidDate: '2024-01-15',
      paymentMethod: 'Bank Transfer',
    }
    expect(() => paymentUpdateSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid payment status', () => {
    const invalidData = {
      status: 'INVALID' as any,
    }
    expect(() => paymentUpdateSchema.parse(invalidData)).toThrow()
  })
})

