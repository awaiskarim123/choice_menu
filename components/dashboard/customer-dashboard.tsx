"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/api-client"
import { Calendar, DollarSign, FileText, Upload, LogOut, User } from "lucide-react"
import { Logo } from "@/components/logo"

type Event = {
  id: string
  eventName: string
  eventType: string
  eventDate: string
  status: string
  payments: Array<{
    id: string
    type: string
    amount: number
    dueDate: string
    status: string
  }>
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetchWithAuth("/api/events")
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", "CNIC")

      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast({
        title: "Success",
        description: "CNIC uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo href="/" size="sm" />
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Link href="/book-event">
              <Button>Book New Event</Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  events.reduce((sum, event) => {
                    return (
                      sum +
                      event.payments
                        .filter((p) => p.status === "PENDING")
                        .reduce((s, p) => s + p.amount, 0)
                    )
                  }, 0)
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  events.filter(
                    (e) =>
                      new Date(e.eventDate) >= new Date() &&
                      (e.status === "PENDING" || e.status === "CONFIRMED")
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload CNIC */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload CNIC</CardTitle>
            <CardDescription>Upload your CNIC document for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="cnic-upload"
              />
              <label htmlFor="cnic-upload">
                <Button asChild variant="outline" disabled={uploading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Choose File"}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Bookings</h2>
          {loading ? (
            <div>Loading...</div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No bookings yet.</p>
                <Link href="/book-event">
                  <Button className="mt-4">Book Your First Event</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.eventName}</CardTitle>
                      <CardDescription>
                        {event.eventType} • {formatDate(event.eventDate)}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Payment Schedule</h4>
                      <div className="space-y-2">
                        {event.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium capitalize">{payment.type} Payment</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                Due: {formatDate(payment.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  payment.status === "PAID"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "OVERDUE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

