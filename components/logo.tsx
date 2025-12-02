import Link from "next/link"
import { cn } from "@/lib/utils"

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

  const LogoContent = () => (
    <div className={cn("relative flex items-center gap-3", className)}>
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
        
        {/* White outline */}
        <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2.5" />
        
        {/* CHOICE MENU Text - stacked, positioned in upper half of circle */}
        <text
          x="32"
          y="18"
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontWeight="bold"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="0.5"
          dominantBaseline="middle"
        >
          CHOICE
        </text>
        <text
          x="32"
          y="26"
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontWeight="bold"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="0.5"
          dominantBaseline="middle"
        >
          MENU
        </text>
        
        {/* Spoon and Fork Icon - crossed in lower half, spoon on left, fork on right, spoon in front */}
        <g transform="translate(32, 40)">
          {/* Spoon (left side, in front) */}
          <ellipse cx="-3.5" cy="-5" rx="1.5" ry="2" fill="white" />
          <path
            d="M -3.5 -3 L -3.5 8 M -5 6 L -2 6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Fork (right side, behind) */}
          <path
            d="M 5 -8 L 5 8 M 3 -8 L 3 8 M 1 -8 L 1 8 M -1 -8 L -1 6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
        
        {/* C-shaped arc - partially encircling the spoon and fork */}
        <path
          d="M 20 36 A 12 12 0 0 1 32 24"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 32 48 A 12 12 0 0 1 20 36"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      
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

