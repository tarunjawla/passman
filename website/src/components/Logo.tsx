import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fe3c4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0fdfa" />
        </linearGradient>
      </defs>
      
      {/* Outer circle */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#logoGradient)"
        stroke="#0f172a"
        strokeWidth="2"
      />
      
      {/* Inner circle */}
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="url(#innerGradient)"
        stroke="#0f172a"
        strokeWidth="1"
      />
      
      {/* Shield shape */}
      <path
        d="M32 12 L44 18 L44 30 C44 38 32 50 32 50 C32 50 20 38 20 30 L20 18 Z"
        fill="#0f172a"
        stroke="#0f172a"
        strokeWidth="1"
      />
      
      {/* Lock body */}
      <rect
        x="26"
        y="28"
        width="12"
        height="8"
        rx="2"
        fill="#4fe3c4"
        stroke="#0f172a"
        strokeWidth="1"
      />
      
      {/* Lock shackle */}
      <path
        d="M30 28 L30 24 C30 22 31 20 32 20 C33 20 34 22 34 24 L34 28"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Keyhole */}
      <circle
        cx="32"
        cy="32"
        r="2"
        fill="#0f172a"
      />
      
      {/* Keyhole slot */}
      <rect
        x="31"
        y="34"
        width="2"
        height="3"
        fill="#0f172a"
      />
      
      {/* Security dots */}
      <circle cx="24" cy="20" r="1" fill="#4fe3c4" />
      <circle cx="40" cy="20" r="1" fill="#4fe3c4" />
      <circle cx="24" cy="44" r="1" fill="#4fe3c4" />
      <circle cx="40" cy="44" r="1" fill="#4fe3c4" />
    </svg>
  )
}

export default Logo
