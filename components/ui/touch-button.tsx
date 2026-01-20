"use client"

import { forwardRef, useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TouchButtonProps extends ButtonProps {
  hapticFeedback?: boolean
  rippleEffect?: boolean
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, hapticFeedback = true, rippleEffect = true, children, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      // Haptic feedback for supported devices
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10) // Very light vibration
      }

      // Ripple effect
      if (rippleEffect) {
        const rect = e.currentTarget.getBoundingClientRect()
        const touch = e.touches[0]
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        
        const newRipple = {
          id: Date.now(),
          x,
          y
        }
        
        setRipples(prev => [...prev, newRipple])
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }

      // Call original onTouchStart if provided
      if (props.onTouchStart) {
        props.onTouchStart(e)
      }
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden touch-manipulation select-none",
          "active:scale-95 transition-transform duration-75",
          "min-h-[44px] min-w-[44px]", // Minimum touch target size
          className
        )}
        onTouchStart={handleTouchStart}
        {...props}
      >
        {children}
        
        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 opacity-75" />
          </span>
        ))}
      </Button>
    )
  }
)

TouchButton.displayName = "TouchButton"
