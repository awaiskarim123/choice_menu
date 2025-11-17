"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventBookingSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

type Service = {
  id: string
  name: string
  description: string | null
  price: number
}

type FormData = {
  eventName: string
  eventType: string
  eventStartDate: string
  eventStartTime: string
  eventEndDate?: string
  eventEndTime?: string
  venue: string
  customerAddress?: string
  guestCount: number
  foodIncluded: boolean
  numberOfPeopleServed?: number
  budget: number
  specialRequests?: string
  contactName: string
  contactPhone: string
  contactEmail?: string
  serviceIds: string[]
}

export default function BookEventPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<Record<string, { quantity: number; price: number }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [tentServiceAmount, setTentServiceAmount] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(eventBookingSchema),
    defaultValues: {
      foodIncluded: false,
      serviceIds: [],
      budget: 0,
    },
  })

  const foodIncluded = watch("foodIncluded")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/book-event")
    }
  }, [loading, user, router])

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    calculateTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices, services, tentServiceAmount])

  // Update budget field when totalAmount changes (as a suggestion)
  useEffect(() => {
    if (totalAmount > 0) {
      const currentBudget = watch("budget")
      // Only update if budget is 0 or not set
      if (!currentBudget || currentBudget === 0) {
        setValue("budget", totalAmount, { shouldValidate: false })
      }
    }
  }, [totalAmount, setValue, watch])

  // Update serviceIds in form when selectedServices changes
  useEffect(() => {
    const serviceIds = Object.keys(selectedServices).filter(id => id !== "placeholder" && id !== "")
    if (tentServiceAmount > 0) {
      const tentService = services.find(s => s.name.toLowerCase().includes("tent"))
      if (tentService) {
        if (!serviceIds.includes(tentService.id)) {
          setValue("serviceIds", [...serviceIds, tentService.id], { shouldValidate: false })
        } else {
          setValue("serviceIds", serviceIds, { shouldValidate: false })
        }
      } else if (serviceIds.length > 0) {
        setValue("serviceIds", serviceIds, { shouldValidate: false })
      }
    } else if (serviceIds.length > 0) {
      setValue("serviceIds", serviceIds, { shouldValidate: false })
    }
  }, [selectedServices, tentServiceAmount, services, setValue])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?isActive=true")
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const calculateTotal = () => {
    const servicesTotal = Object.entries(selectedServices).reduce((sum, [serviceId, data]) => {
      return sum + data.price * data.quantity
    }, 0)
    setTotalAmount(servicesTotal + tentServiceAmount)
  }

  const toggleService = (service: Service) => {
    setSelectedServices((prev) => {
      const newState = { ...prev }
      if (newState[service.id]) {
        delete newState[service.id]
      } else {
        newState[service.id] = { quantity: 1, price: service.price }
      }
      return newState
    })
  }

  const onSubmit = async (data: FormData) => {
    // Collect all selected service IDs
    let serviceIds = Object.keys(selectedServices).filter(id => id !== "placeholder" && id !== "" && id !== "tent-service-placeholder")
    const serviceQuantities = { ...selectedServices }
    
    // If tent service amount is provided, find tent service and add it
    if (tentServiceAmount > 0) {
      // Try multiple search patterns to find tent service
      const tentService = services.find(s => {
        const name = s.name.toLowerCase()
        return name.includes("tent") || name.includes("marquee") || name.includes("shamianah")
      })
      
      if (tentService) {
        if (!serviceIds.includes(tentService.id)) {
          serviceIds.push(tentService.id)
        }
        // Always update the tent service with the custom amount
        serviceQuantities[tentService.id] = { 
          quantity: 1, 
          price: tentServiceAmount 
        }
      } else if (serviceIds.length > 0) {
        // If no tent service found but other services selected, use the first service
        // and add tent amount to it (backend will handle via serviceQuantities)
        const firstServiceId = serviceIds[0]
        if (!serviceQuantities[firstServiceId]) {
          serviceQuantities[firstServiceId] = { quantity: 1, price: 0 }
        }
        // Add tent amount to the first service's price
        serviceQuantities[firstServiceId].price += tentServiceAmount
      }
    }

    // Validate that at least one service is selected OR tent service amount is provided
    if (serviceIds.length === 0 && tentServiceAmount === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service or enter tent service amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Filter out placeholder values
      const validServiceIds = serviceIds.filter(id => 
        id !== "placeholder" && 
        id !== "" && 
        id !== "tent-service-placeholder" &&
        id !== "tent-custom" &&
        id !== "temp-tent-service"
      )

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          serviceIds: validServiceIds.length > 0 ? validServiceIds : serviceIds,
          serviceQuantities,
          tentServiceAmount: tentServiceAmount > 0 ? tentServiceAmount : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to book event")
      }

      toast({
        title: "Success",
        description: "Event booked successfully!",
      })
      router.push("/events")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  const firstPayment = totalAmount * 0.2
  const secondPayment = totalAmount * 0.5
  const finalPayment = totalAmount * 0.3

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl text-center">Event Reservation Form - Client Information</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-center">
              Choice Menu Private Limited - Catering & Tent Service
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={async (e) => {
              e.preventDefault()
              
              // Get form data without validation
              const formData = watch()
              
              // Collect serviceIds
              let serviceIds = Object.keys(selectedServices).filter(id => id !== "placeholder" && id !== "")
              
              // If tent service amount is provided, try to find tent service
              if (tentServiceAmount > 0) {
                const tentService = services.find(s => {
                  const name = s.name.toLowerCase()
                  return name.includes("tent") || name.includes("marquee") || name.includes("shamianah")
                })
                
                if (tentService && !serviceIds.includes(tentService.id)) {
                  serviceIds.push(tentService.id)
                } else if (serviceIds.length === 0) {
                  // Use placeholder if no services found - backend will handle it
                  serviceIds = ["tent-service"]
                }
              }
              
              // Submit directly without validation
              await onSubmit({ ...formData, serviceIds: serviceIds.length > 0 ? serviceIds : ["tent-service"] } as FormData)
            }} className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Client Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name *</Label>
                    <Input
                      id="contactName"
                      {...register("contactName")}
                      placeholder="Full Name"
                      className="cursor-pointer"
                    />
                    {errors.contactName && (
                      <p className="text-sm text-destructive">{errors.contactName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      {...register("contactPhone")}
                      placeholder="03001234567"
                      className="cursor-pointer"
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">CNIC Number</Label>
                    <Input
                      id="cnic"
                      placeholder="12345-1234567-1"
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customerAddress">Customer Address (for Event Setup)</Label>
                    <textarea
                      id="customerAddress"
                      {...register("customerAddress")}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                      placeholder="Complete address for event setup"
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Event Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Input
                      id="eventType"
                      {...register("eventType")}
                      placeholder="Wedding, Birthday, Corporate, etc."
                      className="cursor-pointer"
                    />
                    {errors.eventType && (
                      <p className="text-sm text-destructive">{errors.eventType.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event Name *</Label>
                    <Input
                      id="eventName"
                      {...register("eventName")}
                      placeholder="Event Name"
                      className="cursor-pointer"
                    />
                    {errors.eventName && (
                      <p className="text-sm text-destructive">{errors.eventName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventStartDate">Event Start Date *</Label>
                    <Input
                      id="eventStartDate"
                      type="date"
                      {...register("eventStartDate")}
                      className="cursor-pointer"
                    />
                    {errors.eventStartDate && (
                      <p className="text-sm text-destructive">{errors.eventStartDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventStartTime">Event Start Time *</Label>
                    <Input
                      id="eventStartTime"
                      type="time"
                      {...register("eventStartTime")}
                      className="cursor-pointer"
                    />
                    {errors.eventStartTime && (
                      <p className="text-sm text-destructive">{errors.eventStartTime.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventEndDate">Event End Date</Label>
                    <Input
                      id="eventEndDate"
                      type="date"
                      {...register("eventEndDate")}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventEndTime">Event End Time</Label>
                    <Input
                      id="eventEndTime"
                      type="time"
                      {...register("eventEndTime")}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      {...register("venue")}
                      placeholder="Event location"
                      className="cursor-pointer"
                    />
                    {errors.venue && (
                      <p className="text-sm text-destructive">{errors.venue.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestCount">Number of Guests *</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      {...register("guestCount", { valueAsNumber: true })}
                      min="1"
                      className="cursor-pointer"
                    />
                    {errors.guestCount && (
                      <p className="text-sm text-destructive">{errors.guestCount.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Food Included *</Label>
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="foodIncluded"
                          value="yes"
                          checked={foodIncluded === true}
                          onChange={() => setValue("foodIncluded", true)}
                          className="cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="foodIncluded"
                          value="no"
                          checked={foodIncluded === false}
                          onChange={() => setValue("foodIncluded", false)}
                          className="cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {foodIncluded && (
                    <div className="space-y-2">
                      <Label htmlFor="numberOfPeopleServed">If yes, Number of People Served</Label>
                      <Input
                        id="numberOfPeopleServed"
                        type="number"
                        {...register("numberOfPeopleServed", { valueAsNumber: true })}
                        min="1"
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (PKR) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      {...register("budget", { valueAsNumber: true })}
                      min="0"
                      placeholder="Enter your budget"
                      className="cursor-pointer"
                    />
                    {errors.budget && (
                      <p className="text-sm text-destructive">{errors.budget.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Selection */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Services Selection</h3>
                
                {/* Tent Service with Amount */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                  <Label htmlFor="tentServiceAmount">Tent Service: PKR</Label>
                  <Input
                    id="tentServiceAmount"
                    type="number"
                    min="0"
                    value={tentServiceAmount}
                    onChange={(e) => setTentServiceAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    (Includes tent structure with sidewalls, basic flooring, setup)
                  </p>
                </div>

                {/* Other Services */}
                <div className="grid md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        checked={!!selectedServices[service.id]}
                        onChange={() => toggleService(service)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer">
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Total Services Amount */}
                <div className="p-4 bg-primary/5 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Services Amount:</span>
                    <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Payment Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  The payment will be divided into three installments:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>20% non-refundable advance payment upon reservation</li>
                  <li>50% payment required 5 days before the event</li>
                  <li>Remaining balance to be paid after event completion</li>
                </ul>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <Label>First payment (20%)</Label>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(firstPayment)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <Label>Second payment (50%)</Label>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(secondPayment)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <Label>Final payment (30%)</Label>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(finalPayment)}</p>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Policies</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <p className="font-semibold mb-1">Cancellation Policy:</p>
                    <p className="text-muted-foreground">
                      In case of cancellation, a 20% cancellation fee will be deducted from the total booking amount if not informed before a week and is not a natural cause.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="font-semibold mb-1">Event Delay Policy:</p>
                    <p className="text-muted-foreground">
                      If the event is delayed, we will cooperate with clients to accommodate the delay, including adjusting the event setup, food service, and other logistics where possible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Notes/Requests</Label>
                <textarea
                  id="specialRequests"
                  {...register("specialRequests")}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Submit Reservation"}
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
