'use client'

// Monad Chain Logo
export function MonadLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="monadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#836EF9" />
          <stop offset="100%" stopColor="#5B4ACF" />
        </linearGradient>
      </defs>
      {/* Monad M shape / abstract logo */}
      <circle cx="16" cy="16" r="14" fill="url(#monadGradient)" />
      <path
        d="M9 20V12L12.5 16L16 12L19.5 16L23 12V20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// Chain info mapping
export const CHAIN_INFO = {
  monad: {
    name: 'Monad',
    logo: MonadLogo,
    color: '#836EF9',
  },
  ethereum: {
    name: 'Ethereum',
    logo: EthereumLogo,
    color: '#627EEA',
  },
}

// Ethereum Logo (for future use)
export function EthereumLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#627EEA" />
      <path d="M16 4L16 12.8L22.4 16L16 4Z" fill="white" fillOpacity="0.6" />
      <path d="M16 4L9.6 16L16 12.8L16 4Z" fill="white" />
      <path d="M16 21.6L16 28L22.4 17.2L16 21.6Z" fill="white" fillOpacity="0.6" />
      <path d="M16 28L16 21.6L9.6 17.2L16 28Z" fill="white" />
      <path d="M16 20.4L22.4 16L16 12.8L16 20.4Z" fill="white" fillOpacity="0.2" />
      <path d="M9.6 16L16 20.4L16 12.8L9.6 16Z" fill="white" fillOpacity="0.6" />
    </svg>
  )
}

// PulseChain Logo
export function PulseChainLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#00FF00" />
      <path
        d="M10 16L14 12L16 14L18 10L22 16L18 20L16 18L14 22L10 16Z"
        fill="white"
      />
    </svg>
  )
}

// Avalanche Logo
export function AvalancheLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#E84142" />
      <path
        d="M16 8L22 20H10L16 8Z"
        fill="white"
      />
      <path
        d="M11 20L14 15H8L11 20Z"
        fill="white"
      />
    </svg>
  )
}

// BNB Chain Logo
export function BNBChainLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#F3BA2F" />
      <path
        d="M16 8L20 12L17.5 14.5L20 17L16 21L12 17L14.5 14.5L12 12L16 8Z"
        fill="white"
      />
    </svg>
  )
}
