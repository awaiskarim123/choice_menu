"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import CustomerDashboard from "@/components/dashboard/customer-dashboard"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Mark component as mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to login if not authenticated (only after mount to prevent hydration issues)
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/auth/login")
    }
  }, [mounted, loading, user, router])

  // Show loading state during initial hydration or auth check
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Return null if not authenticated (redirect is in progress)
  if (!user) {
    return null
  }

  return user.role === "ADMIN" ? <AdminDashboard /> : <CustomerDashboard />
}

