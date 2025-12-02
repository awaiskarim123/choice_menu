"use client"

import Link from "next/link"
import Image from "next/image"
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Try different image formats
  const imageSources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"]

  const handleImageError = () => {
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      setImageError(true)
    }
  }

  const LogoContent = () => (
    <div className={cn("relative flex items-center gap-3", className)}>
      {!imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSources[currentImageIndex]}
          alt="Choice Menu Logo"
          className={cn(sizeClasses[size], "flex-shrink-0 object-contain")}
          onError={handleImageError}
        />
      ) : (
        // Fallback SVG logo - exact match to image
        <svg
          width={size === "sm" ? 48 : size === "md" ? 64 : 96}
          height={size === "sm" ? 48 : size === "md" ? 64 : 96}
          viewBox="0 0 64 64"
          className={cn(sizeClasses[size], "flex-shrink-0")}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Solid blue circular background */}
          <circle cx="32" cy="32" r="30" fill="hsl(221.2 83.2% 53.3%)" />
          
          {/* Thick white circular border */}
          <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2.5" />
          
          {/* CHOICE text - upper half, centered */}
          <text
            x="32"
            y="15"
            textAnchor="middle"
            fill="white"
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="1"
          >
            CHOICE
          </text>
          
          {/* MENU text - directly below CHOICE */}
          <text
            x="32"
            y="22"
            textAnchor="middle"
            fill="white"
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="1"
          >
            MENU
          </text>
          
          {/* C-shaped arc - starts near top-left of spoon, sweeps down around bottom, ends near top-right of fork */}
          <path
            d="M 20 30 A 12 12 0 0 1 20 42 A 12 12 0 0 1 44 42 A 12 12 0 0 1 44 30"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Fork on the left - two vertical lines representing fork tines */}
          <g transform="translate(26, 40)">
            <line x1="0" y1="-8" x2="0" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="2.5" y1="-8" x2="2.5" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </g>
          
          {/* Spoon on the right - oval head with handle, slightly in front */}
          <g transform="translate(38, 40)">
            {/* Spoon oval head */}
            <ellipse cx="0" cy="-5" rx="2" ry="2.5" fill="white" />
            {/* Spoon handle */}
            <line x1="0" y1="-2.5" x2="0" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            {/* Spoon base */}
            <line x1="-1.5" y1="4" x2="1.5" y2="4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
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

