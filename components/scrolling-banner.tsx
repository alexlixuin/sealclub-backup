"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ScrollingBannerProps {
  text: string
  speed?: number
  className?: string
}

export function ScrollingBanner({ text, speed = 30, className }: ScrollingBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return

    const textWidth = textRef.current.offsetWidth
    const containerWidth = containerRef.current.offsetWidth

    // Calculate duration based on text width and speed
    const duration = textWidth / speed

    // Create keyframes for continuous scrolling
    const keyframes = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${textWidth / 3}px); }
      }
    `

    const styleSheet = document.createElement("style")
    styleSheet.textContent = keyframes
    document.head.appendChild(styleSheet)

    // Apply animation to the text element
    textRef.current.style.animation = `scroll ${duration}s linear infinite`

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [speed, text])

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden whitespace-nowrap bg-background border-b border-border relative", className)}
    >
      <div ref={textRef} className="inline-block py-1.5 px-4">
        {text}
        <span className="inline-block px-8">•</span>
        {text}
        <span className="inline-block px-8">•</span>
        {text}
      </div>
    </div>
  )
}
