import { Organization, LocalBusiness, Service, WebSite } from "@/types/structured-data"

interface StructuredDataProps {
  data: Organization | LocalBusiness | Service | WebSite | Record<string, unknown>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

