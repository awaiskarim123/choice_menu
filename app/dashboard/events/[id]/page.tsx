"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/api-client"
import { ArrowLeft } from "lucide-react"

type Event = {
  id: string
  eventName: string
  eventType: string
  eventDate: string
  eventTime: string
  venue: string
  guestCount: number
  budget: number
  specialRequests: string | null
  status: string
  contactName: string
  contactPhone: string
  contactEmail: string | null
  customer: {
    name: string
    phone: string
    email: string | null
  }
  eventServices: Array<{
    id: string
    quantity: number
    price: number
    service: {
      name: string
      description: string | null
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
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetchWithAuth(`/api/events/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch event")
      }

      setEvent(data.event)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load event",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    )
  }

  if (!event) {
    return null
  }

  const totalAmount = event.payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Event Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">{event.eventName}</CardTitle>
                  <CardDescription>
                    {event.eventType} • {formatDate(event.eventDate)} at {event.eventTime}
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
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guest Count</p>
                  <p className="font-medium">{event.guestCount} guests</p>
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
                    className="flex justify-between items-center p-4 bg-gray-50 rounded"
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
                  <p className="text-lg font-semibold">Total</p>
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
                    className="flex justify-between items-center p-4 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium capitalize">{payment.type} Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(payment.dueDate)}
                      </p>
                      {payment.paidDate && (
                        <p className="text-sm text-green-600">
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
                      className="block p-3 bg-gray-50 rounded hover:bg-gray-100"
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
  )
}

