import { NextRequest, NextResponse } from "next/server"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { verifyToken, getTokenFromRequest, JWTPayload } from "./jwt"

export async function verifyAuth(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return null
    }
    return verifyToken(token)
  } catch (error) {
    return null
  }
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const user = await verifyAuth(request)
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }
  return { user }
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const authResult = await requireAuth(request)
  if ("error" in authResult) {
    return authResult
  }

  if (authResult.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return authResult
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
