import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { paymentUpdateSchema } from "@/lib/validations"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request)
    if ("error" in authResult) {
      return authResult.error
    }
    const { user } = authResult

    const body = await request.json()
    const validatedData = paymentUpdateSchema.parse(body)

    // Get payment with event to check authorization
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        event: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Check authorization (admin or event owner)
    if (
      user.role !== "ADMIN" &&
      payment.event.customerId !== user.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: any = {
      status: validatedData.status,
    }

    if (validatedData.paidDate) {
      updateData.paidDate = new Date(validatedData.paidDate)
    }

    if (validatedData.paymentMethod) {
      updateData.paymentMethod = validatedData.paymentMethod
    }

    if (validatedData.transactionId) {
      updateData.transactionId = validatedData.transactionId
    }

    if (validatedData.notes) {
      updateData.notes = validatedData.notes
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            eventName: true,
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: "Payment updated successfully",
      payment: updatedPayment,
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

