import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { eventBookingSchema } from "@/lib/validations"
import { calculatePaymentSchedule } from "@/lib/payment-schedule"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request)
    if (!authResult) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const customerId = searchParams.get("customerId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}

    // RBAC: If user is not ADMIN, only show their own events
    if (authResult.role !== "ADMIN") {
      where.customerId = authResult.userId
    } else if (customerId) {
      // Admin can filter by customerId if provided
      where.customerId = customerId
    }

    if (status) {
      where.status = status
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          eventServices: {
            include: {
              service: true,
            },
          },
          payments: {
            orderBy: {
              dueDate: "asc",
            },
          },
          documents: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Skip validation for now - use body directly
    const validatedData = body as any
    
    // Get customerId from body or use a default guest user
    // If customerId is not provided, we need to create or find a guest user
    let customerId = validatedData.customerId
    if (!customerId) {
      // Try to find or create a guest user
      const guestUser = await prisma.user.findFirst({
        where: { email: "guest@choicemenu.com" }
      })
      
      if (guestUser) {
        customerId = guestUser.id
      } else {
        // Create a guest user if it doesn't exist
        const newGuestUser = await prisma.user.create({
          data: {
            name: "Guest User",
            email: "guest@choicemenu.com",
            phone: "0000000000",
            password: "guest", // This won't be used for authentication
            role: "CUSTOMER"
          }
        })
        customerId = newGuestUser.id
      }
    }

    // Filter out invalid service IDs (placeholders, empty strings, etc.)
    const serviceIdsArray = Array.isArray(validatedData.serviceIds) ? validatedData.serviceIds : []
    const validServiceIds = serviceIdsArray.filter(
      (id: string) => id && 
      id !== "placeholder" && 
      id !== "tent-service-placeholder" && 
      id !== "tent-custom" &&
      id !== "temp-tent-service" &&
      id !== "tent-service" &&
      typeof id === "string" &&
      id.trim() !== ""
    )

    // Handle tent service amount if provided
    let tentServiceAmount = 0
    if (body.tentServiceAmount && typeof body.tentServiceAmount === "number" && body.tentServiceAmount > 0) {
      tentServiceAmount = body.tentServiceAmount
    }

    // Find or get tent service
    let tentService = null
    if (tentServiceAmount > 0 || validServiceIds.length === 0) {
      // Try to find existing tent service
      tentService = await prisma.service.findFirst({
        where: {
          OR: [
            { name: { contains: "tent", mode: "insensitive" } },
            { name: { contains: "marquee", mode: "insensitive" } },
            { name: { contains: "shamianah", mode: "insensitive" } },
          ],
        },
      })

      // If tent service doesn't exist and tent amount is provided, create it
      if (!tentService && tentServiceAmount > 0) {
        tentService = await prisma.service.create({
          data: {
            name: "Tent Service",
            description: "Tent structure with sidewalls, basic flooring, and setup",
            price: tentServiceAmount,
            isActive: true,
          },
        })
      }

      // Add tent service to valid service IDs if not already included
      if (tentService && !validServiceIds.includes(tentService.id)) {
        validServiceIds.push(tentService.id)
      }
    }

    // Ensure we have at least one valid service
    if (validServiceIds.length === 0) {
      return NextResponse.json(
        { error: "At least one service must be selected or tent service amount must be provided" },
        { status: 400 }
      )
    }

    // Get selected services (allow custom pricing, so don't require all to be active)
    const services = await prisma.service.findMany({
      where: {
        id: { in: validServiceIds },
      },
    })

    // Verify all service IDs exist
    const foundServiceIds = services.map(s => s.id)
    const missingServiceIds = validServiceIds.filter((id: string) => !foundServiceIds.includes(id))
    if (missingServiceIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid service IDs: ${missingServiceIds.join(", ")}` },
        { status: 400 }
      )
    }

    // Calculate total amount from serviceQuantities if provided, otherwise use service prices
    let totalAmount = validServiceIds.reduce((sum: number, serviceId: string) => {
      const serviceData = body.serviceQuantities?.[serviceId]
      if (serviceData) {
        return sum + serviceData.price * serviceData.quantity
      }
      // Fallback to service price if not in serviceQuantities
      const service = services.find(s => s.id === serviceId)
      return sum + (service?.price || 0)
    }, 0)

    // If tent service amount is provided and tent service exists, ensure it uses the custom amount
    if (tentService && tentServiceAmount > 0) {
      // Check if tent service is already in the total
      const tentServiceInTotal = validServiceIds.includes(tentService.id)
      if (tentServiceInTotal) {
        // Replace tent service amount with custom amount
        const existingTentAmount = body.serviceQuantities?.[tentService.id]?.price || tentService.price
        totalAmount = totalAmount - existingTentAmount + tentServiceAmount
      } else {
        totalAmount += tentServiceAmount
      }
    }

    // Create event
    const eventStartDate = new Date(validatedData.eventStartDate)
    const eventEndDate = validatedData.eventEndDate ? new Date(validatedData.eventEndDate) : null
    
    const event = await prisma.event.create({
      data: {
        customerId: customerId,
        eventName: validatedData.eventName,
        eventType: validatedData.eventType,
        eventStartDate: eventStartDate,
        eventStartTime: validatedData.eventStartTime,
        eventEndDate: eventEndDate,
        eventEndTime: validatedData.eventEndTime || null,
        venue: validatedData.venue,
        customerAddress: validatedData.customerAddress || null,
        guestCount: validatedData.guestCount,
        foodIncluded: validatedData.foodIncluded || false,
        numberOfPeopleServed: validatedData.numberOfPeopleServed || null,
        budget: validatedData.budget,
        specialRequests: validatedData.specialRequests || null,
        contactName: validatedData.contactName,
        contactPhone: validatedData.contactPhone,
        contactEmail: validatedData.contactEmail || null,
        status: "PENDING",
        // Legacy fields
        eventDate: eventStartDate,
        eventTime: validatedData.eventStartTime,
        eventServices: {
          create: validServiceIds.map((serviceId: string) => {
            const service = services.find(s => s.id === serviceId)
            let serviceData = body.serviceQuantities?.[serviceId] || { quantity: 1, price: service?.price || 0 }
            
            // If this is the tent service and custom amount is provided, use it
            if (tentService && serviceId === tentService.id && tentServiceAmount > 0) {
              serviceData = {
                quantity: serviceData.quantity || 1,
                price: tentServiceAmount,
              }
            }
            
            return {
              serviceId: serviceId,
              quantity: serviceData.quantity || 1,
              price: serviceData.price || 0,
            }
          }),
        },
      },
      include: {
        eventServices: {
          include: {
            service: true,
          },
        },
      },
    })

    // Create payment schedule
    const paymentSchedule = calculatePaymentSchedule(
      totalAmount,
      eventStartDate
    )

    await prisma.payment.createMany({
      data: paymentSchedule.map((payment) => ({
        eventId: event.id,
        type: payment.type,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: "PENDING",
      })),
    })


    return NextResponse.json(
      { message: "Event booked successfully", event },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

