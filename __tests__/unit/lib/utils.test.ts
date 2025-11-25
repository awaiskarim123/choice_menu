import { formatCurrency, formatDate, formatDateTime, cn } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    const result1 = formatCurrency(1000)
    expect(result1).toContain('1,000')
    expect(result1).toMatch(/PKR|Rs|₨/)
    
    const result2 = formatCurrency(50000)
    expect(result2).toContain('50,000')
    
    const result3 = formatCurrency(1234567)
    expect(result3).toContain('1,234,567')
  })

  it('should format zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('should format decimal numbers correctly', () => {
    const result1 = formatCurrency(1000.5)
    expect(result1).toContain('1,00')
    
    const result2 = formatCurrency(1234.99)
    expect(result2).toContain('1,23')
  })

  it('should format large numbers correctly', () => {
    const formatted = formatCurrency(1000000)
    expect(formatted).toContain('1,000,000')
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

describe('formatDate', () => {
  it('should format Date objects correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toContain('2024')
    expect(formatted).toContain('Jan')
  })

  it('should format date strings correctly', () => {
    const dateString = '2024-01-15T00:00:00.000Z'
    const formatted = formatDate(dateString)
    expect(formatted).toContain('2024')
  })

  it('should handle different date formats', () => {
    const date = new Date('2024-12-25')
    const formatted = formatDate(date)
    expect(formatted).toBeTruthy()
    expect(typeof formatted).toBe('string')
  })
})

describe('formatDateTime', () => {
  it('should format Date objects with time correctly', () => {
    const date = new Date('2024-01-15T14:30:00.000Z')
    const formatted = formatDateTime(date)
    expect(formatted).toContain('2024')
    expect(formatted).toContain('at')
  })

  it('should format date strings with time correctly', () => {
    const dateString = '2024-01-15T14:30:00.000Z'
    const formatted = formatDateTime(dateString)
    expect(formatted).toBeTruthy()
    expect(typeof formatted).toBe('string')
  })
})

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
    // Order may vary, so just check both classes are present
  })
})

