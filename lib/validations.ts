import { z } from "zod"

export type Role = "ADMIN" | "CUSTOMER"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  cnic: z.string()
    .optional()
    .refine(
      (val) => !val || /^\d{5}-\d{7}-\d{1}$/.test(val),
      "CNIC must be in format XXXXX-XXXXXXX-X (13 digits)"
    ),
  role: z.enum(["ADMIN", "CUSTOMER"]).default("CUSTOMER"),
})

export const eventBookingSchema = z.object({
  eventName: z.string().min(3, "Event name must be at least 3 characters"),
  eventType: z.string().min(1, "Event type is required"),
  eventStartDate: z.string().min(1, "Event start date is required"),
  eventStartTime: z.string().min(1, "Event start time is required"),
  eventEndDate: z.string().optional(),
  eventEndTime: z.string().optional(),
  venue: z.string().min(3, "Venue must be at least 3 characters"),
  customerAddress: z.string().optional(),
  guestCount: z.number().min(1, "Guest count must be at least 1"),
  foodIncluded: z.boolean().default(false),
  numberOfPeopleServed: z.number().optional(),
  budget: z.number().min(0, "Budget must be positive"),
  specialRequests: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z.string().min(10, "Contact phone is required"),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  serviceIds: z.array(z.string()).optional(), // Service selection is optional
  // Signature and payment fields
  lastPaymentDate: z.string().optional(),
  clientSignature: z.string().optional(),
  representativeSignature: z.string().optional(),
  signatureDate: z.string().optional(),
  // Legacy fields for backward compatibility
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
}).refine((data) => {
  // Allow empty serviceIds if tentServiceAmount is provided (handled by backend)
  // This refinement is checked at the API level, not form level
  return true
})

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  isActive: z.boolean().default(true),
})

export const updateEventStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"]),
  cancellationReason: z.string().optional(),
  delayReason: z.string().optional(),
})

export const paymentUpdateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "OVERDUE", "REFUNDED"]),
  paidDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
})

