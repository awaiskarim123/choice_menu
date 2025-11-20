import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyAuth } from "@/lib/auth"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check authentication - only admins can create admin users
    const authResult = await verifyAuth(request)
    const isAdmin = authResult?.role === "ADMIN"
    
    // Force CUSTOMER role for public/unauthenticated registrations
    // Only authenticated admins can create admin users (would need separate endpoint)
    const userRole = isAdmin && body.role === "ADMIN" ? "ADMIN" : "CUSTOMER"

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email || undefined },
          { phone: validatedData.phone },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email or phone" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user - always use CUSTOMER for public registration
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone,
        cnic: validatedData.cnic || null,
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

