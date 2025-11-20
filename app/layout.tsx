import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Choice Menu - Event Management & Catering Services",
    template: "%s | Choice Menu"
  },
  description: "Professional event management and catering services. Book your perfect event with tent setup, catering, and comprehensive event planning services in Pakistan.",
  keywords: ["event management", "catering services", "tent service", "event planning", "wedding catering", "corporate events", "Pakistan"],
  authors: [{ name: "Choice Menu" }],
  creator: "Choice Menu",
  publisher: "Choice Menu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Choice Menu",
    title: "Choice Menu - Event Management & Catering Services",
    description: "Professional event management and catering services. Book your perfect event with tent setup, catering, and comprehensive event planning services.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Choice Menu - Event Management & Catering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Choice Menu - Event Management & Catering Services",
    description: "Professional event management and catering services. Book your perfect event with tent setup, catering, and comprehensive event planning services.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

