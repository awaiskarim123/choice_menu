"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { StructuredData } from "@/components/structured-data"
import { Phone, MessageCircle, Mail, Share2, MapPin, Menu, X, User, LogOut } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      // Focus first menu item when menu opens
      const firstLink = menuRef.current?.querySelector("a")
      firstLink?.focus()
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isMobileMenuOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Choice Menu",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    description: "Professional event management and catering services",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
    },
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Choice Menu",
    description: "Professional event management and catering services",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
  }

  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={localBusinessSchema} />
      <div className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <Logo href="/" size="md" showText={true} />
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 lg:gap-4 flex-wrap">
            <Link href="/about">
              <Button variant="ghost" className="text-sm lg:text-base">About</Button>
            </Link>
            <Link href="/services">
              <Button variant="ghost" className="text-sm lg:text-base">Services</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-sm lg:text-base">Contact</Button>
            </Link>
            <Link href="/book-event">
              <Button className="text-sm lg:text-base">Book Event</Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" className="text-sm lg:text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                  className="text-sm lg:text-base"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" className="text-sm lg:text-base">Login</Button>
              </Link>
            )}
          </div>
          {/* Mobile Menu Button */}
          <Button
            ref={buttonRef}
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={menuRef}
            role="menu"
            aria-label="Navigation menu"
            className="md:hidden border-t bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2 max-w-7xl">
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" tabIndex={0}>
                <Button variant="ghost" className="w-full justify-start">About</Button>
              </Link>
              <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" tabIndex={0}>
                <Button variant="ghost" className="w-full justify-start">Services</Button>
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" tabIndex={0}>
                <Button variant="ghost" className="w-full justify-start">Contact</Button>
              </Link>
              <Link href="/book-event" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" tabIndex={0}>
                <Button className="w-full justify-start">Book Event</Button>
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" tabIndex={0}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      {user.name}
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} role="menuitem" tabIndex={0}>
                  <Button variant="outline" className="w-full justify-start">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Your Trusted Event Management Partner
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
          From tent setup to catering, we handle every detail of your special event
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Link href="/book-event" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">Book Your Event</Button>
          </Link>
          <Link href="/services" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">View Services</Button>
          </Link>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Services</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tent Setup</CardTitle>
              <CardDescription>Professional tent installation for any event size</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Catering</CardTitle>
              <CardDescription>Delicious food preparation and service</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sound System</CardTitle>
              <CardDescription>High-quality audio equipment and setup</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lighting</CardTitle>
              <CardDescription>Professional lighting solutions</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Entertainment</CardTitle>
              <CardDescription>DJ, music, and entertainment services</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Event Planning</CardTitle>
              <CardDescription>Complete event coordination and management</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Contact Us</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Ali Ahmed Jan - Executive Chef */}
          <Card className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Ali Ahmed Jan</CardTitle>
              <CardDescription className="text-sm sm:text-base">Executive Chef</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:03555833735" className="text-sm sm:text-base hover:text-primary transition-colors break-all">
                  0355-5833735
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <a 
                  href="https://wa.me/923126967522" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base hover:text-green-600 transition-colors break-all"
                >
                  0312-6967522
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Sher Baz Khan - General Manager */}
          <Card className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Sher Baz Khan</CardTitle>
              <CardDescription className="text-sm sm:text-base">General Manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:03555021522" className="text-sm sm:text-base hover:text-primary transition-colors break-all">
                  03555021522
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <a 
                  href="https://wa.me/923175559090" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base hover:text-green-600 transition-colors break-all"
                >
                  0317-5559090
                </a>
              </div>
            </CardContent>
          </Card>

          {/* General Contact Information */}
          <Card className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">General Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="mailto:choicemenu@gmail.com" 
                  className="text-sm sm:text-base hover:text-primary transition-colors break-all"
                >
                  choicemenu@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <a 
                  href="https://facebook.com/choicemenu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base hover:text-blue-600 transition-colors"
                >
                  @choice menu
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  Choice Menu Shop No.1, 2 Near Al Karim Bakers Aliabad Hunza
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-7xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Plan Your Event?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8">Let us make your special day unforgettable</p>
          <Link href="/book-event">
            <Button size="lg" variant="secondary">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground max-w-7xl">
          <p className="text-sm sm:text-base">&copy; 2024 Choice Menu. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </>
  )
}

