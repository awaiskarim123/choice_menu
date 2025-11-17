import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo href="/" size="md" showText={true} />
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
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
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Choice Menu</h1>
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-lg text-muted-foreground">
              Choice Menu is a premier event management and catering company dedicated to making
              your special occasions unforgettable. With years of experience in the industry, we
              provide comprehensive event solutions tailored to your needs.
            </p>

            <h2 className="text-2xl font-semibold mt-8">Our Mission</h2>
            <p>
              To deliver exceptional event management services that exceed expectations, creating
              memorable experiences for our clients through attention to detail, quality service,
              and innovative solutions.
            </p>

            <h2 className="text-2xl font-semibold mt-8">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Complete event planning and coordination</li>
              <li>Professional tent setup and installation</li>
              <li>Premium catering services</li>
              <li>High-quality sound systems and audio equipment</li>
              <li>Professional lighting solutions</li>
              <li>Entertainment services including DJ and music</li>
              <li>Customized packages for all event types</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8">Why Choose Us</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Years of experience in managing events of all sizes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We use only the best equipment and ingredients</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Reliability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>You can count on us to deliver on time, every time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Customer Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Dedicated support throughout your event journey</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/book-event">
              <Button size="lg">Book Your Event Today</Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Choice Menu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

