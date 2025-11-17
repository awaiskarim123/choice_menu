import { addDays, subDays } from "date-fns"
import { PaymentType } from "@prisma/client"

export interface PaymentScheduleItem {
  type: PaymentType
  amount: number
  dueDate: Date
  percentage: number
}

export function calculatePaymentSchedule(
  totalAmount: number,
  eventDate: Date
): PaymentScheduleItem[] {
  const firstPayment: PaymentScheduleItem = {
    type: PaymentType.FIRST,
    amount: totalAmount * 0.2, // 20%
    dueDate: new Date(), // Due immediately
    percentage: 20,
  }

  const secondPayment: PaymentScheduleItem = {
    type: PaymentType.SECOND,
    amount: totalAmount * 0.5, // 50%
    dueDate: subDays(eventDate, 5), // 5 days before event
    percentage: 50,
  }

  const finalPayment: PaymentScheduleItem = {
    type: PaymentType.FINAL,
    amount: totalAmount * 0.3, // 30%
    dueDate: addDays(eventDate, 1), // Day after event
    percentage: 30,
  }

  return [firstPayment, secondPayment, finalPayment]
}

export function calculateCancellationRefund(
  totalAmount: number,
  cancellationDate: Date,
  eventDate: Date
): number {
  const daysUntilEvent = Math.ceil(
    (eventDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 20% deduction if less than 1 week (7 days) notice
  if (daysUntilEvent < 7) {
    return totalAmount * 0.8 // 80% refund
  }

  return totalAmount // Full refund
}

