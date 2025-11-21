import jwt, { SignOptions } from "jsonwebtoken"
import { UserRole } from "@prisma/client"

// Fail fast if JWT_SECRET is not configured - security critical
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in environment variables")
}

// Use StringValue type for expiresIn (compatible with jsonwebtoken's SignOptions)
// StringValue accepts formats like "7d", "1h", "30m", etc.
type StringValue = string & { __brand: "StringValue" }
const JWT_EXPIRES_IN: StringValue = (process.env.JWT_EXPIRES_IN || "7d") as StringValue

export interface JWTPayload {
  userId: string
  email?: string | null
  phone: string
  name: string
  role: UserRole
}

export function generateToken(payload: JWTPayload): string {
  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN }
  return jwt.sign(payload, JWT_SECRET, signOptions)
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

