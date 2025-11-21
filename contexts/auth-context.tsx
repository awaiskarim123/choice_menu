"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email?: string | null
  phone: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize auth state from localStorage synchronously
function getInitialAuthState(): { token: string | null; user: User | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null }
  }

  try {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
      }
    }
  } catch (error) {
    console.error("Error loading initial auth state:", error)
    // Clear corrupted data
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } catch {
      // Ignore localStorage errors
    }
  }

  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state synchronously from localStorage
  const initialState = getInitialAuthState()
  const [user, setUser] = useState<User | null>(initialState.user)
  const [token, setToken] = useState<string | null>(initialState.token)
  const [loading, setLoading] = useState(false) // Start as false since we initialize synchronously
  const router = useRouter()
  const pathname = usePathname()

  // Load auth state from localStorage
  const loadAuthState = useCallback(() => {
    if (typeof window === "undefined") return
    
    try {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } else if (!storedToken && !storedUser) {
        // Only clear state if both are missing (don't clear on partial data)
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error("Error loading auth state:", error)
      // Only clear on actual parse errors, not on missing data
      try {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } catch {
        // Ignore localStorage errors
      }
      setToken(null)
      setUser(null)
    }
  }, [])

  // Re-sync auth state on route changes to ensure persistence
  useEffect(() => {
    if (typeof window === "undefined") return

    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    
    // Always re-sync from localStorage on route changes to prevent state loss
    // This ensures auth state persists across navigation
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Always update from localStorage to ensure state matches storage
        // This prevents state loss during navigation
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error re-syncing auth state:", error)
        // Clear corrupted data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
      }
    }
    // IMPORTANT: Don't clear state if localStorage is empty
    // This prevents clearing auth on navigation to public routes
    // State will only be cleared on explicit logout or 401 from API
  }, [pathname]) // Only depend on pathname to trigger on route changes

  useEffect(() => {
    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        loadAuthState()
      }
    }

    // Listen for custom auth logout event
    const handleAuthLogout = () => {
      setToken(null)
      setUser(null)
    }

    // Re-check auth state on focus to ensure it's in sync
    const handleFocus = () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")
        
        // If we have stored auth but state is null, reload it
        if (storedToken && storedUser && (!token || !user)) {
          loadAuthState()
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      window.addEventListener("auth:logout", handleAuthLogout)
      window.addEventListener("focus", handleFocus)
      return () => {
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener("auth:logout", handleAuthLogout)
        window.removeEventListener("focus", handleFocus)
      }
    }
  }, [loadAuthState, token, user])

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    router.push("/auth/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

