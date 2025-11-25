import { calculatePaymentSchedule, calculateCancellationRefund } from '@/lib/payment-schedule'
import { PaymentType } from '@prisma/client'

describe('calculatePaymentSchedule', () => {
  it('should calculate correct payment schedule for 100000 PKR', () => {
    const eventDate = new Date('2024-12-25')
    const schedule = calculatePaymentSchedule(100000, eventDate)

    expect(schedule).toHaveLength(3)
    
    // First payment: 20%
    expect(schedule[0].type).toBe(PaymentType.FIRST)
    expect(schedule[0].amount).toBe(20000)
    expect(schedule[0].percentage).toBe(20)
    
    // Second payment: 50%
    expect(schedule[1].type).toBe(PaymentType.SECOND)
    expect(schedule[1].amount).toBe(50000)
    expect(schedule[1].percentage).toBe(50)
    
    // Final payment: 30%
    expect(schedule[2].type).toBe(PaymentType.FINAL)
    expect(schedule[2].amount).toBe(30000)
    expect(schedule[2].percentage).toBe(30)
  })

  it('should calculate correct payment schedule for 50000 PKR', () => {
    const eventDate = new Date('2024-12-25')
    const schedule = calculatePaymentSchedule(50000, eventDate)

    expect(schedule[0].amount).toBe(10000) // 20%
    expect(schedule[1].amount).toBe(25000) // 50%
    expect(schedule[2].amount).toBe(15000) // 30%
  })

  it('should set first payment due date to today', () => {
    const eventDate = new Date('2024-12-25')
    const schedule = calculatePaymentSchedule(100000, eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const firstPaymentDate = new Date(schedule[0].dueDate)
    firstPaymentDate.setHours(0, 0, 0, 0)
    
    expect(firstPaymentDate.getTime()).toBeLessThanOrEqual(today.getTime())
  })

  it('should set second payment 5 days before event', () => {
    const eventDate = new Date('2024-12-25')
    const schedule = calculatePaymentSchedule(100000, eventDate)
    const expectedDate = new Date('2024-12-20')
    
    const secondPaymentDate = new Date(schedule[1].dueDate)
    expect(secondPaymentDate.toDateString()).toBe(expectedDate.toDateString())
  })

  it('should set final payment 1 day after event', () => {
    const eventDate = new Date('2024-12-25')
    const schedule = calculatePaymentSchedule(100000, eventDate)
    const expectedDate = new Date('2024-12-26')
    
    const finalPaymentDate = new Date(schedule[2].dueDate)
    expect(finalPaymentDate.toDateString()).toBe(expectedDate.toDateString())
  })

  it('should handle zero amount', () => {
    const eventDate = new Date('2024-12-25')
    const schedule = calculatePaymentSchedule(0, eventDate)

    expect(schedule[0].amount).toBe(0)
    expect(schedule[1].amount).toBe(0)
    expect(schedule[2].amount).toBe(0)
  })
})

describe('calculateCancellationRefund', () => {
  it('should return full refund if cancelled more than 7 days before event', () => {
    const totalAmount = 100000
    const cancellationDate = new Date('2024-12-10')
    const eventDate = new Date('2024-12-25')
    
    const refund = calculateCancellationRefund(totalAmount, cancellationDate, eventDate)
    expect(refund).toBe(100000)
  })

  it('should return 80% refund if cancelled less than 7 days before event', () => {
    const totalAmount = 100000
    const cancellationDate = new Date('2024-12-20')
    const eventDate = new Date('2024-12-25')
    
    const refund = calculateCancellationRefund(totalAmount, cancellationDate, eventDate)
    expect(refund).toBe(80000)
  })

  it('should return 80% refund if cancelled exactly 6 days before event', () => {
    const totalAmount = 100000
    const cancellationDate = new Date('2024-12-19')
    const eventDate = new Date('2024-12-25')
    
    const refund = calculateCancellationRefund(totalAmount, cancellationDate, eventDate)
    expect(refund).toBe(80000)
  })

  it('should return 80% refund if cancelled on the same day', () => {
    const totalAmount = 100000
    const cancellationDate = new Date('2024-12-25')
    const eventDate = new Date('2024-12-25')
    
    const refund = calculateCancellationRefund(totalAmount, cancellationDate, eventDate)
    expect(refund).toBe(80000)
  })
})

