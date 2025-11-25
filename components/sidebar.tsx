"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering user-dependent UI after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = user?.role === "ADMIN"

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Events",
      href: "/events",
      icon: Calendar,
      show: true,
    },
    {
      name: "Book Event",
      href: "/book-event",
      icon: BookOpen,
      show: true,
    },
    {
      name: "Services",
      href: isAdmin ? "/admin/services" : "/services",
      icon: FileText,
      show: true,
    },
    {
      name: "Home",
      href: "/",
      icon: Home,
      show: true,
    },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card border-2 shadow-lg hover:bg-accent"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r bg-card/50 backdrop-blur-sm transition-transform lg:translate-x-0 shadow-lg",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b px-6 bg-card/50">
            <Logo href="/" size="sm" showText={true} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => {
              if (!item.show) return null
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "scale-110")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and actions */}
          <div className="border-t bg-card/30 p-4 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold truncate">
                  {mounted ? (user?.name || "Guest") : "Guest"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mounted ? (isAdmin ? "Administrator" : "Customer") : "Loading..."}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {mounted && (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex-1 border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

