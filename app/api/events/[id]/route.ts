import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            cnic: true,
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
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    // Skip validation for now - use body directly
    const validatedData = body as any

    const updateData: any = {
      status: validatedData.status,
    }

    if (validatedData.status === "CANCELLED" && validatedData.cancellationReason) {
      updateData.cancellationReason = validatedData.cancellationReason
      updateData.cancellationDate = new Date()
    }

    if (validatedData.delayReason) {
      updateData.delayReason = validatedData.delayReason
      updateData.delayDate = new Date()
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        payments: true,
      },
    })

    return NextResponse.json({ message: "Event updated successfully", event })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

