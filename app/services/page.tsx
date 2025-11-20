"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Logo } from "@/components/logo"

type Service = {
  id: string
  name: string
  description: string | null
  price: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?isActive=true")
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo href="/" size="md" showText={true} />
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            <Link href="/book-event">
              <Button>Book Event</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            We offer a comprehensive range of event management and catering services to make your
            event perfect
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <Card className="border-2 max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">No services available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-base">{service.description || "Premium service"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(service.price)}</span>
                    <Link href="/book-event">
                      <Button className="rounded-lg">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/book-event">
            <Button size="lg" className="rounded-lg">Book Your Event</Button>
          </Link>
        </div>
      </div>

      <footer className="border-t bg-card/50 backdrop-blur-sm py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Choice Menu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

