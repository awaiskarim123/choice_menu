export interface Organization {
  "@context": "https://schema.org"
  "@type": "Organization"
  name: string
  url: string
  logo?: string
  description?: string
  contactPoint?: {
    "@type": "ContactPoint"
    telephone?: string
    contactType?: string
    email?: string
  }
  sameAs?: string[]
}

export interface LocalBusiness {
  "@context": "https://schema.org"
  "@type": "LocalBusiness"
  name: string
  description: string
  url: string
  telephone?: string
  address?: {
    "@type": "PostalAddress"
    addressCountry?: string
    addressLocality?: string
  }
  priceRange?: string
  servesCuisine?: string
}

export interface Service {
  "@context": "https://schema.org"
  "@type": "Service"
  name: string
  description: string
  provider: {
    "@type": "Organization"
    name: string
  }
  areaServed?: {
    "@type": "Country"
    name: string
  }
  offers?: {
    "@type": "Offer"
    price: string
    priceCurrency: string
  }
}

export interface WebSite {
  "@context": "https://schema.org"
  "@type": "WebSite"
  name: string
  url: string
  potentialAction?: {
    "@type": "SearchAction"
    target: {
      "@type": "EntryPoint"
      urlTemplate: string
    }
    "query-input": string
  }
}

