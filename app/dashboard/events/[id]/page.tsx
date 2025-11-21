"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/api-client"
import { Sidebar } from "@/components/sidebar"
import { ArrowLeft } from "lucide-react"

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
    paymentMethod: string | null
    transactionId: string | null
  }>
  documents: Array<{
    id: string
    fileName: string
    filePath: string
    documentType: string
  }>
}

export default function EventDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  // Determine where to go back to
  const backPath = searchParams.get("from") || "/events"

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`/api/events/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this event. You can only view your own events.",
            variant: "destructive",
          })
          router.push(backPath)
          return
        }
        throw new Error(data.error || "Failed to fetch event")
      }

      setEvent(data.event)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load event",
        variant: "destructive",
      })
      router.push(backPath)
    } finally {
      setLoading(false)
    }
  }, [params.id, toast, router, backPath])

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  }, [params.id, fetchEvent])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
      case "REJECTED":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground border border-border"
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading event...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">Event not found</p>
              <Link href={backPath} className="mt-4 inline-block">
                <Button>Go Back</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalAmount = event.eventServices.reduce((sum, es) => sum + es.price * es.quantity, 0)
  const totalPayments = event.payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">
          <Link href={backPath}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Event Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{event.eventName}</CardTitle>
                    <CardDescription>
                      {event.eventType} • {formatDate(event.eventStartDate)} at {event.eventStartTime}
                      {event.eventEndDate && (
                        <> • Ends: {formatDate(event.eventEndDate)}{event.eventEndTime && ` at ${event.eventEndTime}`}</>
                      )}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{event.venue}</p>
                    {event.customerAddress && (
                      <p className="text-sm text-muted-foreground mt-1">{event.customerAddress}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Guest Count</p>
                    <p className="font-medium">{event.guestCount} guests</p>
                    {event.foodIncluded && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Food included {event.numberOfPeopleServed && `(${event.numberOfPeopleServed} people)`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">{formatCurrency(event.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{event.contactName}</p>
                    <p className="text-sm text-muted-foreground">{event.contactPhone}</p>
                    {event.contactEmail && (
                      <p className="text-sm text-muted-foreground">{event.contactEmail}</p>
                    )}
                  </div>
                </div>
                {event.specialRequests && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Special Requests</p>
                    <p className="mt-1">{event.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.eventServices.map((es) => (
                  <div
                    key={es.id}
                    className="flex justify-between items-center p-4 bg-muted rounded"
                  >
                    <div>
                      <p className="font-medium">{es.service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {es.service.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {es.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(es.price * es.quantity)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-lg font-semibold">Total Services</p>
                  <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 bg-muted rounded"
                  >
                    <div>
                      <p className="font-medium capitalize">{payment.type} Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(payment.dueDate)}
                      </p>
                      {payment.paidDate && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Paid: {formatDate(payment.paidDate)}
                        </p>
                      )}
                      {payment.paymentMethod && (
                        <p className="text-sm text-muted-foreground">
                          Method: {payment.paymentMethod}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs border ${
                          payment.status === "PAID"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : payment.status === "OVERDUE"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                            : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {event.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                    >
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Info (Admin only) */}
          {user?.role === "ADMIN" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="text-muted-foreground">Name:</span> {event.customer.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span> {event.customer.phone}
                  </p>
                  {event.customer.email && (
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {event.customer.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

