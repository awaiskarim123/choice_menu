import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Health check endpoint for monitoring and load balancers
 * Returns 200 if the application and database are healthy
 */
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "choice-menu",
        database: "connected",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "choice-menu",
        database: "disconnected",
        error: process.env.NODE_ENV === "development" 
          ? error instanceof Error ? error.message : "Unknown error"
          : "Database connection failed",
      },
      { status: 503 }
    )
  }
}

