import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if ("error" in authResult) {
      return authResult.error
    }
    const { user } = authResult

    const formData = await request.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string | null
    const documentType = (formData.get("documentType") as string) || "CNIC"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and PDF are allowed" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const fileName = `${user.userId}-${timestamp}.${extension}`
    const filePath = join(uploadDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save document record
    const document = await prisma.uploadedDocument.create({
      data: {
        userId: user.userId,
        eventId: eventId || null,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        fileType: file.type,
        fileSize: file.size,
        documentType,
      },
    })

    return NextResponse.json(
      { message: "File uploaded successfully", document },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

