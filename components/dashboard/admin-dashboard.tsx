/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/api-client"
import { Sidebar } from "@/components/sidebar"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react"

type Event = {
  id: string
  eventName: string
  eventType: string
  eventDate: string
  status: string
  customer: {
    name: string
    phone: string
  }
  payments: Array<{
    id: string
    type: string
    amount: number
    status: string
  }>
}

type Stats = {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  totalRevenue: number
  upcomingEvents: number
  totalCustomers: number
  recentBookings: number
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetchStats()
    fetchEvents()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth("/api/dashboard/stats")
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchEvents = useCallback(async () => {
    try {
      const url = new URL("/api/events", window.location.origin)
      if (statusFilter) url.searchParams.set("status", statusFilter)

      const response = await fetchWithAuth(url.toString())
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents, statusFilter])

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      const response = await fetchWithAuth(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast({
        title: "Success",
        description: "Event status updated",
      })
      fetchEvents()
      fetchStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.recentBookings} new this week
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCustomers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8 border-2">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 rounded-lg"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border-2 rounded-lg bg-background hover:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Bookings</h2>
          {loading ? (
            <div>Loading...</div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No bookings found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="border-2 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{event.eventName}</CardTitle>
                      <CardDescription className="text-base">
                        {event.eventType} • {formatDate(event.eventDate)} • Customer:{" "}
                        {event.customer.name} ({event.customer.phone})
                      </CardDescription>
                    </div>
                    <select
                      value={event.status}
                      onChange={(e) => updateEventStatus(event.id, e.target.value)}
                      className="px-3 py-2 border-2 rounded-lg text-sm bg-background hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          event.payments.reduce((sum, p) => sum + p.amount, 0)
                        )}
                      </p>
                    </div>
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button variant="outline" className="rounded-lg">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

