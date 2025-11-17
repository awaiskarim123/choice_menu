import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo href="/" size="md" showText={true} />
          <div className="flex gap-4">
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link href="/services">
              <Button variant="ghost">Services</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            <Link href="/book-event">
              <Button>Book Event</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Your Trusted Event Management Partner
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          From tent setup to catering, we handle every detail of your special event
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/book-event">
            <Button size="lg">Book Your Event</Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline">View Services</Button>
          </Link>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
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

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Event?</h2>
          <p className="text-xl mb-8">Let us make your special day unforgettable</p>
          <Link href="/book-event">
            <Button size="lg" variant="secondary">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Choice Menu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

