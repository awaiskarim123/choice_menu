import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

export function middleware(request: NextRequest) {
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/services",
    "/auth/login",
    "/auth/register",
  ]

  // Allow public routes
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Check for token in Authorization header
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

  // For protected routes, check if user is authenticated
  if (request.nextUrl.pathname.startsWith("/dashboard") || 
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/book-event")) {
    
    // For API routes, verify token
    if (request.nextUrl.pathname.startsWith("/api")) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      try {
        const user = verifyToken(token)
        
        // Check admin routes
        if (request.nextUrl.pathname.startsWith("/api/admin") && user.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/book-event",
    "/api/:path*",
  ],
}

