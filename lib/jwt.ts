import jwt, { SignOptions } from "jsonwebtoken"
import { UserRole } from "@prisma/client"

// Fail fast if JWT_SECRET is not configured - security critical
const JWT_SECRET_ENV = process.env.JWT_SECRET
if (!JWT_SECRET_ENV) {
  throw new Error("JWT_SECRET must be configured in environment variables")
}
// TypeScript now knows JWT_SECRET is definitely a string
const JWT_SECRET: string = JWT_SECRET_ENV

// expiresIn accepts number (seconds) or string (timespan like "7d", "1h", "30m")
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: string
  email?: string | null
  phone: string
  name: string
  role: UserRole
}

export function generateToken(payload: JWTPayload): string {
  // expiresIn accepts number (seconds) or string (timespan like "7d", "1h", "30m")
  const signOptions: SignOptions = { 
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"]
  }
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

