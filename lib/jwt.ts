import jwt, { SignOptions } from "jsonwebtoken"
import { UserRole } from "@prisma/client"

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: string
  email?: string | null
  phone: string
  name: string
  role: UserRole
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

