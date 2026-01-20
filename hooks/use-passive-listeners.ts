"use client"

import { useEffect } from "react"

export function usePassiveListeners() {
  useEffect(() => {
    // Add passive event listeners for better scroll performance
    const addPassiveListener = (element: Element | Window, event: string, handler: EventListener) => {
      element.addEventListener(event, handler, { passive: true })
      return () => element.removeEventListener(event, handler)
    }

    // Optimize scroll performance
    const handleScroll = () => {
      // Throttle scroll events
      requestAnimationFrame(() => {
        // Handle scroll logic here if needed
      })
    }

    const handleTouchStart = () => {
      // Handle touch start with passive listener
    }

    const handleTouchMove = () => {
      // Handle touch move with passive listener
    }

    // Add passive listeners
    const cleanupScroll = addPassiveListener(window, 'scroll', handleScroll)
    const cleanupTouchStart = addPassiveListener(window, 'touchstart', handleTouchStart)
    const cleanupTouchMove = addPassiveListener(window, 'touchmove', handleTouchMove)

    return () => {
      cleanupScroll()
      cleanupTouchStart()
      cleanupTouchMove()
    }
  }, [])
}
