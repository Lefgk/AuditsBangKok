'use client'

// Wat Arun Temple Icon -  Landmark
export function TempleIcon({ className = "w-8 h-8", gradient = true }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="templeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#F4C430" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
      </defs>

      {/* Main Prang (Central Spire) */}
      <path
        d="M32 4L28 12L24 16L22 24L20 32L18 44L16 52H48L46 44L44 32L42 24L40 16L36 12L32 4Z"
        fill={gradient ? "url(#templeGradient)" : "currentColor"}
      />

      {/* Spire Tip */}
      <path
        d="M32 2L30 6L32 4L34 6L32 2Z"
        fill={gradient ? "url(#templeGradient)" : "currentColor"}
      />

      {/* Base Platform */}
      <rect
        x="12"
        y="52"
        width="40"
        height="4"
        fill={gradient ? "url(#templeGradient)" : "currentColor"}
        opacity="0.9"
      />

      {/* Lower Base */}
      <rect
        x="8"
        y="56"
        width="48"
        height="4"
        fill={gradient ? "url(#templeGradient)" : "currentColor"}
        opacity="0.8"
      />

      {/* Side Prangs Left */}
      <path
        d="M18 24L16 28L14 36L12 44L10 52H20L19 44L18 36L17 28L18 24Z"
        fill={gradient ? "url(#templeGradient)" : "currentColor"}
        opacity="0.85"
      />

      {/* Side Prangs Right */}
      <path
        d="M46 24L48 28L50 36L52 44L54 52H44L45 44L46 36L47 28L46 24Z"
        fill={gradient ? "url(#templeGradient)" : "currentColor"}
        opacity="0.85"
      />

      {/* Decorative Tiers on Main Prang */}
      <ellipse
        cx="32"
        cy="18"
        rx="6"
        ry="1.5"
        fill="#0E0E0E"
        opacity="0.3"
      />
      <ellipse
        cx="32"
        cy="28"
        rx="8"
        ry="2"
        fill="#0E0E0E"
        opacity="0.25"
      />
      <ellipse
        cx="32"
        cy="38"
        rx="10"
        ry="2"
        fill="#0E0E0E"
        opacity="0.2"
      />

      {/* Shield/Security Element Overlay */}
      <path
        d="M32 20C32 20 26 24 26 32C26 40 32 44 32 44C32 44 38 40 38 32C38 24 32 20 32 20Z"
        fill="none"
        stroke={gradient ? "#D4AF37" : "currentColor"}
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  )
}

// Simplified Temple Icon for Favicon
export function TempleIconSimple({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="templeGradientSimple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
      </defs>

      {/* Main Spire */}
      <path
        d="M16 2L12 8L10 14L8 22L6 28H26L24 22L22 14L20 8L16 2Z"
        fill="url(#templeGradientSimple)"
      />

      {/* Base */}
      <rect x="4" y="28" width="24" height="2" fill="url(#templeGradientSimple)" opacity="0.9" />
    </svg>
  )
}
