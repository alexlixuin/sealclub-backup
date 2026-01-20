"use client"

import { memo } from "react"

const SimpleBackground = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
          </linearGradient>
          <linearGradient id="beam2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.1)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(147, 51, 234, 0.1)" />
          </linearGradient>
        </defs>

        {/* Static beam paths */}
        <path d="M0,100 Q400,50 800,100 T1600,100" stroke="url(#beam1)" strokeWidth="2" fill="none" opacity="0.3" />
        <path d="M0,200 Q600,150 1200,200 T2400,200" stroke="url(#beam2)" strokeWidth="1.5" fill="none" opacity="0.2" />
        <path d="M0,300 Q300,250 600,300 T1200,300" stroke="url(#beam1)" strokeWidth="1" fill="none" opacity="0.15" />
      </svg>
    </div>
  )
})

SimpleBackground.displayName = "SimpleBackground"

export default SimpleBackground
