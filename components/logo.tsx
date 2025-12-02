"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface LogoProps {
  className?: string
  href?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, href = "/", size = "md", showText = false }: LogoProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  }

  const [imageError, setImageError] = useState(false)

  const LogoContent = () => (
    <div className={cn("relative flex items-center gap-3", className)}>
      {!imageError ? (
        <img
          src="/logo.png"
          alt="Choice Menu Logo"
          className={cn(sizeClasses[size], "flex-shrink-0 object-contain")}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback SVG logo matching the design exactly
        <svg
          width={size === "sm" ? 48 : size === "md" ? 64 : 96}
          height={size === "sm" ? 48 : size === "md" ? 64 : 96}
          viewBox="0 0 64 64"
          className={cn(sizeClasses[size], "flex-shrink-0")}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue circular background */}
          <circle cx="32" cy="32" r="30" fill="hsl(221.2 83.2% 53.3%)" />
          
          {/* White outline border */}
          <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2.5" />
          
          {/* CHOICE MENU Text - stacked, positioned in upper half */}
          <text
            x="32"
            y="16"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="0.8"
          >
            CHOICE
          </text>
          <text
            x="32"
            y="24"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="0.8"
          >
            MENU
          </text>
          
          {/* C-shaped arc - starts from top-left, goes around bottom, ends at top-right */}
          <path
            d="M 18 28 Q 18 42, 32 46 Q 46 42, 46 28"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Fork on the left (two vertical lines) */}
          <g transform="translate(24, 38)">
            <line x1="0" y1="-6" x2="0" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="-6" x2="2" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Spoon on the right (oval head with handle) */}
          <g transform="translate(40, 38)">
            <ellipse cx="0" cy="-4" rx="2" ry="2.5" fill="white" />
            <line x1="0" y1="-1.5" x2="0" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="-1.5" y1="6" x2="1.5" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      )}
      
      {showText && (
        <span className="text-xl font-bold text-primary hidden sm:inline-block">
          Choice Menu
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

