// Helper function to make authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Only clear auth and redirect if we get a 401 AND we actually sent a token
  // This prevents clearing auth on public endpoints that return 401
  if (response.status === 401 && token) {
    // Token expired or invalid - only clear if we had a token
    if (typeof window !== "undefined") {
      // Don't use window.location.href as it causes full page reload
      // Let the calling component handle the redirect
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      // Dispatch a custom event so auth context can update
      window.dispatchEvent(new Event("auth:logout"))
    }
  }

  // Handle 403 Forbidden errors - user doesn't have permission
  // Don't clear auth for 403, just return the response so the component can handle it
  if (response.status === 403) {
    // The component will handle showing appropriate error message
  }

  return response
}

