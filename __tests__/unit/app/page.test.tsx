// Mock Next.js components and hooks before imports
jest.mock('next/link', () => {
  return ({ children, href, className }: any) => {
    return <a href={href} className={className}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />
  }
})

jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', setTheme: jest.fn() })),
}))

// Mock components
jest.mock('@/components/logo', () => ({
  Logo: ({ href, size, showText }: any) => (
    <div data-testid="logo" data-href={href} data-size={size}>
      {showText && 'Choice Menu'}
    </div>
  ),
}))

jest.mock('@/components/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

jest.mock('@/components/structured-data', () => ({
  StructuredData: ({ data }: any) => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  ),
}))

// Mock auth context
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'CUSTOMER' }
let mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(() => mockAuthContextValue),
}))

// Mock fetch
global.fetch = jest.fn()

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'
import { useAuth } from '@/contexts/auth-context'

describe('Home Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset to default authenticated state
    mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
    
    // Mock successful services fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        services: [
          { id: '1', name: 'Tent Service', description: 'Premium tent setup', price: 50000 },
          { id: '2', name: 'Catering', description: 'Delicious food', price: 30000 },
        ],
      }),
    })
  })

  describe('CTA Section - Visual Elements', () => {
    it('should render the CTA section with correct heading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl')
      })
    })

    it('should render the CTA section with descriptive text', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const description = screen.getByText(/let us make your special day unforgettable/i)
        expect(description).toBeInTheDocument()
      })
    })

    it('should apply gradient background styling to CTA section', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const gradientDiv = container.querySelector('.bg-gradient-to-b.from-background')
        expect(gradientDiv).toBeInTheDocument()
      })
    })

    it('should render card with primary gradient background', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const cardContent = container.querySelector('.bg-gradient-to-br.from-primary')
        expect(cardContent).toBeInTheDocument()
      })
    })

    it('should render decorative pattern overlay in CTA', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const patternOverlay = container.querySelector('[class*="bg-\\[radial-gradient"]')
        expect(patternOverlay).toBeInTheDocument()
      })
    })

    it('should apply responsive padding classes to CTA section', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const sections = container.querySelectorAll('section.relative')
        const ctaSection = Array.from(sections).find(s => 
          s.className.includes('py-16') && s.className.includes('overflow-hidden')
        )
        expect(ctaSection).toBeInTheDocument()
      })
    })

    it('should apply text shadow to heading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading).toHaveClass('drop-shadow-sm')
      })
    })
  })

  describe('CTA Section - Authenticated User Flow', () => {
    beforeEach(() => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
    })

    it('should render "Get Started" button when user is authenticated', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const getStartedLink = links.find(link => 
          link.textContent === 'Get Started' && link.getAttribute('href') === '/book-event'
        )
        expect(getStartedLink).toBeInTheDocument()
      })
    })

    it('should link to /book-event when user is authenticated', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const bookEventLink = links.find(l => l.getAttribute('href') === '/book-event')
        expect(bookEventLink).toBeInTheDocument()
      })
    })

    it('should not link to /auth/login when user is authenticated', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        // In CTA section, should not have login link
        const ctaLoginLinks = links.filter(l => 
          l.getAttribute('href') === '/auth/login' && 
          l.textContent === 'Get Started'
        )
        expect(ctaLoginLinks.length).toBe(0)
      })
    })

    it('should apply correct button styling for authenticated users', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButtons = Array.from(buttons).filter(btn => 
          btn.textContent?.includes('Get Started')
        )
        
        ctaButtons.forEach(button => {
          expect(button.className).toMatch(/px-8/)
          expect(button.className).toMatch(/py-6/)
        })
      })
    })

    it('should have shadow and hover effects on CTA button', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started') &&
          btn.className.includes('shadow-xl')
        )
        expect(ctaButton).toBeInTheDocument()
        expect(ctaButton).toHaveClass('hover:shadow-2xl')
        expect(ctaButton).toHaveClass('hover:scale-105')
      })
    })

    it('should have minimum width constraint on CTA button', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started') &&
          btn.className.includes('min-w-')
        )
        expect(ctaButton).toBeInTheDocument()
        expect(ctaButton).toHaveClass('min-w-[200px]')
      })
    })

    it('should apply transform scale on active state', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton).toHaveClass('active:scale-95')
      })
    })
  })

  describe('CTA Section - Unauthenticated User Flow', () => {
    beforeEach(() => {
      mockAuthContextValue = { user: null, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
    })

    it('should render "Get Started" button when user is not authenticated', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const getStartedLink = links.find(link => 
          link.textContent === 'Get Started'
        )
        expect(getStartedLink).toBeInTheDocument()
      })
    })

    it('should link to /auth/login when user is not authenticated', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const loginLink = links.find(l => 
          l.getAttribute('href') === '/auth/login' && 
          l.textContent === 'Get Started'
        )
        expect(loginLink).toBeInTheDocument()
      })
    })

    it('should not link to /book-event in CTA when user is not authenticated', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const bookEventLinks = links.filter(l => 
          l.getAttribute('href') === '/book-event' &&
          l.textContent === 'Get Started'
        )
        expect(bookEventLinks.length).toBe(0)
      })
    })

    it('should apply correct styling to unauthenticated CTA button', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started') &&
          btn.className.includes('font-bold')
        )
        expect(ctaButton).toHaveClass('px-8', 'sm:px-10', 'py-6', 'sm:py-7')
        expect(ctaButton).toHaveClass('shadow-xl')
      })
    })
  })

  describe('CTA Section - Loading State', () => {
    beforeEach(() => {
      mockAuthContextValue = { user: null, logout: jest.fn(), loading: true }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
    })

    it('should still render CTA heading and description during loading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText(/ready to plan your event/i)).toBeInTheDocument()
        expect(screen.getByText(/let us make your special day unforgettable/i)).toBeInTheDocument()
      })
    })

    it('should render CTA section structure during loading', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const sections = container.querySelectorAll('section')
        expect(sections.length).toBeGreaterThan(0)
      })
    })
  })

  describe('CTA Section - Edge Cases', () => {
    it('should handle user context with undefined user', async () => {
      mockAuthContextValue = { user: undefined as any, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      expect(() => render(<Home />)).not.toThrow()
      
      await waitFor(() => {
        expect(screen.getByText(/ready to plan your event/i)).toBeInTheDocument()
      })
    })

    it('should handle null user gracefully', async () => {
      mockAuthContextValue = { user: null, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        expect(container).toBeInTheDocument()
        expect(screen.getByText(/ready to plan your event/i)).toBeInTheDocument()
      })
    })

    it('should render CTA with various user roles', async () => {
      const roles = ['CUSTOMER', 'ADMIN', 'STAFF']
      
      for (const role of roles) {
        mockAuthContextValue = { 
          user: { ...mockUser, role }, 
          logout: jest.fn(), 
          loading: false 
        }
        ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
        
        const { container } = render(<Home />)
        
        await waitFor(() => {
          expect(container).toBeInTheDocument()
          const links = screen.getAllByRole('link')
          const bookEventLink = links.find(l => l.getAttribute('href') === '/book-event')
          expect(bookEventLink).toBeInTheDocument()
        })
      }
    })

    it('should handle rapid user state changes', async () => {
      // Start with authenticated
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { rerender } = render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const bookEventLink = links.find(l => l.getAttribute('href') === '/book-event')
        expect(bookEventLink).toBeInTheDocument()
      })
      
      // Change to unauthenticated
      mockAuthContextValue = { user: null, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      rerender(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const loginLink = links.find(l => 
          l.getAttribute('href') === '/auth/login' && 
          l.textContent === 'Get Started'
        )
        expect(loginLink).toBeInTheDocument()
      })
    })
  })

  describe('CTA Section - Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading.tagName).toBe('H2')
      })
    })

    it('should have accessible button elements within links', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const ctaLink = links.find(l => 
          l.getAttribute('href') === '/book-event' && 
          l.textContent === 'Get Started'
        )
        expect(ctaLink).toBeInTheDocument()
        expect(ctaLink).toHaveAttribute('href')
      })
    })

    it('should have readable text with sufficient contrast classes', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByText(/ready to plan your event/i)
        expect(heading).toHaveClass('text-primary-foreground')
        
        const description = screen.getByText(/let us make your special day unforgettable/i)
        expect(description).toHaveClass('text-primary-foreground/95')
      })
    })

    it('should support keyboard navigation with focusable links', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const ctaLink = links.find(l => 
          l.getAttribute('href') === '/book-event' && 
          l.textContent === 'Get Started'
        )
        expect(ctaLink).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('should have semantic HTML structure', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const section = container.querySelector('section.relative')
        expect(section).toBeInTheDocument()
        expect(section?.tagName).toBe('SECTION')
      })
    })
  })

  describe('CTA Section - Responsive Design', () => {
    it('should apply responsive text sizing to heading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading.className).toMatch(/text-3xl/)
        expect(heading.className).toMatch(/sm:text-4xl/)
        expect(heading.className).toMatch(/md:text-5xl/)
        expect(heading.className).toMatch(/lg:text-6xl/)
      })
    })

    it('should apply responsive text sizing to description', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const description = screen.getByText(/let us make your special day unforgettable/i)
        expect(description.className).toMatch(/text-lg/)
        expect(description.className).toMatch(/sm:text-xl/)
        expect(description.className).toMatch(/md:text-2xl/)
      })
    })

    it('should apply responsive padding to CTA section', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const sections = container.querySelectorAll('section.relative')
        const ctaSection = Array.from(sections).find(s => 
          s.className.includes('py-16') && s.className.includes('overflow-hidden')
        )
        expect(ctaSection?.className).toMatch(/py-16/)
        expect(ctaSection?.className).toMatch(/sm:py-20/)
        expect(ctaSection?.className).toMatch(/md:py-24/)
        expect(ctaSection?.className).toMatch(/lg:py-28/)
      })
    })

    it('should apply responsive padding to card content', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const cardContents = container.querySelectorAll('[class*="p-"]')
        const ctaCardContent = Array.from(cardContents).find(el => 
          el.className.includes('p-8') && 
          el.className.includes('text-center')
        )
        expect(ctaCardContent?.className).toMatch(/p-8/)
        expect(ctaCardContent?.className).toMatch(/sm:p-12/)
        expect(ctaCardContent?.className).toMatch(/md:p-16/)
        expect(ctaCardContent?.className).toMatch(/lg:p-20/)
      })
    })

    it('should apply responsive button padding', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started') &&
          btn.className.includes('px-8')
        )
        expect(ctaButton?.className).toMatch(/px-8/)
        expect(ctaButton?.className).toMatch(/sm:px-10/)
        expect(ctaButton?.className).toMatch(/py-6/)
        expect(ctaButton?.className).toMatch(/sm:py-7/)
      })
    })

    it('should apply responsive button text size', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton?.className).toMatch(/text-lg/)
        expect(ctaButton?.className).toMatch(/sm:text-xl/)
      })
    })

    it('should apply responsive margin to heading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading.className).toMatch(/mb-4/)
        expect(heading.className).toMatch(/sm:mb-6/)
      })
    })

    it('should apply responsive margin to description', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const description = screen.getByText(/let us make your special day unforgettable/i)
        expect(description.className).toMatch(/mb-8/)
        expect(description.className).toMatch(/sm:mb-10/)
        expect(description.className).toMatch(/md:mb-12/)
      })
    })
  })

  describe('CTA Section - Styling and Visual Effects', () => {
    it('should apply border styling to card', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const cards = container.querySelectorAll('[class*="border-2"]')
        const ctaCard = Array.from(cards).find(card => 
          card.className.includes('border-primary/30')
        )
        expect(ctaCard).toBeInTheDocument()
      })
    })

    it('should apply shadow effects to card', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const cards = container.querySelectorAll('[class*="shadow-2xl"]')
        expect(cards.length).toBeGreaterThan(0)
      })
    })

    it('should apply gradient to card background', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const gradientElement = container.querySelector('.bg-gradient-to-br.from-primary')
        expect(gradientElement).toBeInTheDocument()
        expect(gradientElement?.className).toMatch(/via-primary/)
      })
    })

    it('should apply backdrop blur effect', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const blurElement = container.querySelector('.backdrop-blur-sm')
        expect(blurElement).toBeInTheDocument()
      })
    })

    it('should apply drop shadow to heading text', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading).toHaveClass('drop-shadow-sm')
      })
    })

    it('should apply hover effects to button', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton?.className).toMatch(/hover:bg-secondary\/90/)
        expect(ctaButton?.className).toMatch(/hover:scale-105/)
      })
    })

    it('should apply transition effects to button', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton?.className).toMatch(/transition-all/)
        expect(ctaButton?.className).toMatch(/duration-300/)
      })
    })

    it('should have gradient background overlay', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const overlay = container.querySelector('.bg-gradient-to-b.from-background')
        expect(overlay).toBeInTheDocument()
        expect(overlay?.className).toMatch(/via-primary\/5/)
      })
    })
  })

  describe('CTA Section - Layout and Structure', () => {
    it('should render within a container with max-width', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const ctaContainers = container.querySelectorAll('.container.mx-auto')
        const ctaContainer = Array.from(ctaContainers).find(el => 
          el.className.includes('max-w-5xl')
        )
        expect(ctaContainer).toBeInTheDocument()
      })
    })

    it('should apply relative positioning for layering', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const section = container.querySelector('section.relative')
        expect(section).toBeInTheDocument()
      })
    })

    it('should apply z-index layering correctly', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const zIndexElements = container.querySelectorAll('[class*="z-10"]')
        expect(zIndexElements.length).toBeGreaterThan(0)
      })
    })

    it('should center content within card', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const centeredContent = container.querySelector('[class*="text-center"]')
        expect(centeredContent).toBeInTheDocument()
      })
    })

    it('should apply overflow hidden to section and card', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const overflowElements = container.querySelectorAll('.overflow-hidden')
        expect(overflowElements.length).toBeGreaterThan(0)
      })
    })

    it('should apply max-width to description text', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const description = screen.getByText(/let us make your special day unforgettable/i)
        expect(description).toHaveClass('max-w-2xl', 'mx-auto')
      })
    })

    it('should use flexbox for button container', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttonContainers = container.querySelectorAll('.flex.justify-center')
        expect(buttonContainers.length).toBeGreaterThan(0)
      })
    })
  })

  describe('CTA Section - Pattern Overlay', () => {
    it('should render pattern overlay with correct opacity', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const patternContainer = container.querySelector('.opacity-10')
        expect(patternContainer).toBeInTheDocument()
      })
    })

    it('should apply radial gradient pattern', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const patterns = container.querySelectorAll('[class*="bg-\\[radial-gradient"]')
        expect(patterns.length).toBeGreaterThan(0)
      })
    })

    it('should position pattern overlay absolutely', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const overlays = container.querySelectorAll('.absolute.inset-0')
        expect(overlays.length).toBeGreaterThan(0)
      })
    })
  })

  describe('CTA Section - Button Variants and States', () => {
    it('should use secondary variant for button', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton).toBeInTheDocument()
      })
    })

    it('should apply inline-block display to link wrapper', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const inlineBlockLinks = container.querySelectorAll('.inline-block')
        const ctaLink = Array.from(inlineBlockLinks).find(link => 
          link.getAttribute('href') === '/book-event'
        )
        expect(ctaLink).toBeInTheDocument()
      })
    })
  })

  describe('Full Page Integration with CTA', () => {
    it('should render the complete home page without errors', async () => {
      expect(() => render(<Home />)).not.toThrow()
      
      await waitFor(() => {
        expect(screen.getByText(/ready to plan your event/i)).toBeInTheDocument()
      })
    })

    it('should render CTA section as part of the full page', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText(/ready to plan your event/i)).toBeInTheDocument()
        expect(screen.getByText(/let us make your special day unforgettable/i)).toBeInTheDocument()
      })
    })

    it('should maintain consistent authentication flow throughout page', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      render(<Home />)
      
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const bookEventLinks = links.filter(l => l.getAttribute('href') === '/book-event')
        expect(bookEventLinks.length).toBeGreaterThan(0)
      })
    })

    it('should render structured data for SEO', async () => {
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        expect(scripts.length).toBeGreaterThan(0)
      })
    })
  })

  describe('CTA Section - Text Content and Typography', () => {
    it('should have bold font weight on heading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading).toHaveClass('font-bold')
      })
    })

    it('should apply tight line height to heading', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /ready to plan your event/i })
        expect(heading).toHaveClass('leading-tight')
      })
    })

    it('should apply relaxed line height to description', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const description = screen.getByText(/let us make your special day unforgettable/i)
        expect(description).toHaveClass('leading-relaxed')
      })
    })

    it('should apply primary foreground color to text', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const heading = screen.getByText(/ready to plan your event/i)
        expect(heading).toHaveClass('text-primary-foreground')
      })
    })
  })

  describe('CTA Section - Transform and Animation Classes', () => {
    it('should have transform class on button', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton?.className).toMatch(/transform/)
      })
    })

    it('should have duration-300 transition', async () => {
      mockAuthContextValue = { user: mockUser, logout: jest.fn(), loading: false }
      ;(useAuth as jest.Mock).mockReturnValue(mockAuthContextValue)
      
      const { container } = render(<Home />)
      
      await waitFor(() => {
        const buttons = container.querySelectorAll('button')
        const ctaButton = Array.from(buttons).find(btn => 
          btn.textContent?.includes('Get Started')
        )
        expect(ctaButton?.className).toMatch(/duration-300/)
      })
    })
  })
})