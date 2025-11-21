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
import { Phone, MessageCircle, Mail, Share2, MapPin } from "lucide-react"

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const firstPayment = totalAmount * 0.2
  const secondPayment = totalAmount * 0.5
  const finalPayment = totalAmount * 0.3

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl text-center">Event Reservation Form Client Information</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-center">
              Choice Menu private Limited
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
                      className="w-full min-h-[80px] rounded-lg border-2 border-input bg-background px-3 py-2 text-sm cursor-pointer focus:border-primary transition-colors"
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
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="foodIncluded"
                          value="yes"
                          checked={foodIncluded === true}
                          onChange={() => setValue("foodIncluded", true)}
                          className="cursor-pointer w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="foodIncluded"
                          value="no"
                          checked={foodIncluded === false}
                          onChange={() => setValue("foodIncluded", false)}
                          className="cursor-pointer w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
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
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                  <Label htmlFor="tentServiceAmount">Tent Service: PKR</Label>
                  <Input
                    id="tentServiceAmount"
                    type="number"
                    min="0"
                    value={tentServiceAmount}
                    onChange={(e) => setTentServiceAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                    className="cursor-pointer border-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    (Includes tent structure with sidewalls, basic flooring, setup)
                  </p>
                </div>

                {/* Other Services */}
                <div className="grid md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        checked={!!selectedServices[service.id]}
                        onChange={() => toggleService(service)}
                        className="w-4 h-4 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer flex-1">
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Total Services Amount */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Services Amount:</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
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
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <Label>First payment (20%)</Label>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(firstPayment)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <Label>Second payment (50%)</Label>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(secondPayment)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <Label>Final payment (30%)</Label>
                    <p className="text-lg font-semibold mt-2">{formatCurrency(finalPayment)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="lastPaymentDate">Last Payment Date</Label>
                  <Input
                    id="lastPaymentDate"
                    type="date"
                    className="cursor-pointer"
                    placeholder="Select last payment date"
                  />
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Policies</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="font-semibold mb-1 text-yellow-600 dark:text-yellow-400">Cancellation Policy:</p>
                    <p className="text-muted-foreground">
                      In case of cancellation, a 20% cancellation fee will be deducted from the total booking amount if not informed before a week and is not a natural cause.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="font-semibold mb-1 text-blue-600 dark:text-blue-400">Event Delay Policy:</p>
                    <p className="text-muted-foreground">
                      If the event is delayed, we will cooperate with clients to accommodate the delay, including adjusting the event setup, food service, and other logistics where possible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-2 border-b pb-6">
                <Label htmlFor="specialRequests">Special Notes/Requests</Label>
                <textarea
                  id="specialRequests"
                  {...register("specialRequests")}
                  className="w-full min-h-[100px] rounded-lg border-2 border-input bg-background px-3 py-2 text-sm cursor-pointer focus:border-primary transition-colors"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              {/* Signatures Section */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Signatures</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientSignature">Client&apos;s Signature</Label>
                    <Input
                      id="clientSignature"
                      type="text"
                      className="cursor-pointer"
                      placeholder="Client signature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="representativeSignature">Representative&apos;s Signature</Label>
                    <Input
                      id="representativeSignature"
                      type="text"
                      className="cursor-pointer"
                      placeholder="Representative signature"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="signatureDate">Date</Label>
                    <Input
                      id="signatureDate"
                      type="date"
                      className="cursor-pointer"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Booking Confirmation Message */}
              <div className="space-y-4 border-b pb-6">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Booking Confirmation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once your reservation is confirmed and a copy of your CNIC is provided, our team will contact you to finalize all details and ensure a seamless event setup. For further inquiries or changes to your booking, please contact us at:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="font-semibold">Ali Ahmed Jan (Executive Chef)</div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href="tel:03555833735" className="hover:text-primary">0355-5833735</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <a href="https://wa.me/923126967522" target="_blank" rel="noopener noreferrer" className="hover:text-green-600">0312-6967522</a>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold">Sher Baz Khan (General Manager)</div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href="tel:03555021522" className="hover:text-primary">03555021522</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <a href="https://wa.me/923175559090" target="_blank" rel="noopener noreferrer" className="hover:text-green-600">0317-5559090</a>
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:choicemenu@gmail.com" className="hover:text-primary">choicemenu@gmail.com</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Share2 className="h-4 w-4" />
                        <a href="https://facebook.com/choicemenu" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">@choice menu</a>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>Choice Menu Shop No.1, 2 Near Al Karim Bakers Aliabad Hunza</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg" size="lg">
                  {isSubmitting ? "Submitting..." : "Submit Reservation"}
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline" className="rounded-lg" size="lg">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
