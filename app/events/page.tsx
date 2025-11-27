"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api-client"
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle2, XCircle, Clock3, MoreVertical } from "lucide-react"

type Event = {
  id: string
  eventName: string
  eventType: string
  eventStartDate: string
  eventStartTime: string
  eventEndDate: string | null
  eventEndTime: string | null
  venue: string
  customerAddress: string | null
  guestCount: number
  foodIncluded: boolean
  numberOfPeopleServed: number | null
  budget: number
  specialRequests: string | null
  status: string
  contactName: string
  contactPhone: string
  contactEmail: string | null
  createdAt: string
  customer: {
    id: string
    name: string
    phone: string
    email: string | null
  }
  eventServices: Array<{
    id: string
    quantity: number
    price: number
    service: {
      id: string
      name: string
      description: string | null
      price: number
    }
  }>
  payments: Array<{
    id: string
    type: string
    amount: number
    dueDate: string
    paidDate: string | null
    status: string
  }>
}

export default function EventsPage() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Mark component as mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to login if not authenticated (only after mount to prevent hydration issues)
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/auth/login")
    }
  }, [mounted, user, authLoading, router])

  const fetchEvents = useCallback(async () => {
    if (!token || !user) {
      setLoading(false)
      return
    }

    try {
      const url = new URL("/api/events", window.location.origin)
      if (statusFilter) url.searchParams.set("status", statusFilter)

      const response = await fetchWithAuth(url.toString())

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this resource.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, token, user, router, toast])

  useEffect(() => {
    if (mounted && user && token) {
      fetchEvents()
    }
  }, [mounted, fetchEvents, user, token])

  // Show loading state during initial hydration or auth check
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-500/10 border border-green-500/20",
          icon: CheckCircle2,
          label: "Confirmed"
        }
      case "PENDING":
        return {
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-500/10 border border-yellow-500/20",
          icon: Clock3,
          label: "Pending"
        }
      case "REJECTED":
        return {
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-500/10 border border-red-500/20",
          icon: XCircle,
          label: "Rejected"
        }
      case "COMPLETED":
        return {
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-500/10 border border-blue-500/20",
          icon: CheckCircle2,
          label: "Completed"
        }
      case "CANCELLED":
        return {
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-500/10 border border-gray-500/20",
          icon: XCircle,
          label: "Cancelled"
        }
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          icon: Clock3,
          label: status
        }
    }
  }

  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return "1 day"
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`
  }

  const calculateTotalAmount = (event: Event) => {
    return event.eventServices.reduce((sum, es) => sum + es.price * es.quantity, 0)
  }

  const updateEventStatus = async (eventId: string, status: string) => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to update event status",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetchWithAuth(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to update this event. Only admins and event owners can update events.",
            variant: "destructive",
          })
          return
        }
        throw new Error(result.error || "Failed to update status")
      }

      toast({
        title: "Success",
        description: `Event status updated to ${status}`,
      })

      // Refresh events list
      fetchEvents()
      setOpenMenuId(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update event status",
        variant: "destructive",
      })
    }
  }

  // Show loading state during initial hydration, auth check, or data loading
  if (!mounted || authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Return null if not authenticated (redirect is in progress)
  if (!user || !token) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Events List</h1>
            <p className="text-muted-foreground">Manage and track all your events</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "" ? "default" : "outline"}
              onClick={() => setStatusFilter("")}
              className="rounded-lg"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
              className="rounded-lg"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
              onClick={() => setStatusFilter("CONFIRMED")}
              className="rounded-lg"
            >
              Confirmed
            </Button>
            <Button
              variant={statusFilter === "COMPLETED" ? "default" : "outline"}
              onClick={() => setStatusFilter("COMPLETED")}
              className="rounded-lg"
            >
              Completed
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">No events found</p>
              <Link href="/book-event" className="mt-4 inline-block">
                <Button>Book Your First Event</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Event Name</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Start Date</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">End Date</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Duration</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => {
                      const statusInfo = getStatusInfo(event.status)
                      const StatusIcon = statusInfo.icon
                      const duration = calculateDuration(event.eventStartDate, event.eventEndDate)
                      
                      return (
                        <tr key={event.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{event.eventName}</div>
                              <div className="text-sm text-muted-foreground">{event.eventType}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {new Date(event.eventStartDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric"
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">{event.eventStartTime}</div>
                          </td>
                          <td className="p-4">
                            {event.eventEndDate ? (
                              <div className="text-sm">
                                {new Date(event.eventEndDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric"
                                })}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                            {event.eventEndTime && (
                              <div className="text-xs text-muted-foreground">{event.eventEndTime}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{duration}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                              <span className={`text-sm font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/dashboard/events/${event.id}?from=/events`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                                  className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                                >
                                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                </button>
                                {openMenuId === event.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-20">
                                      <div className="py-1">
                                        {event.status !== "CONFIRMED" && (
                                          <button
                                            onClick={() => updateEventStatus(event.id, "CONFIRMED")}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-foreground"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Mark as Confirmed
                                          </button>
                                        )}
                                        {event.status !== "COMPLETED" && (
                                          <button
                                            onClick={() => updateEventStatus(event.id, "COMPLETED")}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-foreground"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                            Mark as Completed
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}

