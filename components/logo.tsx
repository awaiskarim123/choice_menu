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

  const LogoContent = () => {
    const imageWidth = size === "sm" ? 48 : size === "md" ? 64 : 96
    const imageHeight = size === "sm" ? 48 : size === "md" ? 64 : 96

    return (
      <div className={cn("relative flex items-center gap-3", className)}>
        {!imageError ? (
          <div 
            className={cn(sizeClasses[size], "flex-shrink-0 relative")}
            onError={handleImageError}
          >
            <Image
              src={imageSources[currentImageIndex]}
              alt="Choice Menu Logo"
              width={imageWidth}
              height={imageHeight}
              className="object-contain"
              onError={handleImageError}
              unoptimized
            />
          </div>
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
          
          {/* CHOICE text - upper half, centered, bold white */}
          <text
            x="32"
            y="14"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="0.8"
          >
            CHOICE
          </text>
          
          {/* MENU text - directly below CHOICE */}
          <text
            x="32"
            y="21"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="0.8"
          >
            MENU
          </text>
          
          {/* C-shaped arc - starts from top-left, sweeps down around bottom, ends at top-right */}
          {/* This creates a C shape that partially encircles the cutlery from the bottom */}
          <path
            d="M 18 28 A 14 14 0 0 1 18 44 A 14 14 0 0 1 46 44 A 14 14 0 0 1 46 28"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Fork on the LEFT - two vertical lines (fork tines) */}
          <g transform="translate(25, 38)">
            <line x1="0" y1="-7" x2="0" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="2.5" y1="-7" x2="2.5" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Spoon on the RIGHT - oval head with handle */}
          <g transform="translate(39, 38)">
            {/* Spoon oval head */}
            <ellipse cx="0" cy="-4" rx="2" ry="2.5" fill="white" />
            {/* Spoon handle/stem */}
            <line x1="0" y1="-1.5" x2="0" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Spoon base/end */}
            <line x1="-1.5" y1="5" x2="1.5" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
  }

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

