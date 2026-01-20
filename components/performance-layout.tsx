"use client"

import { usePassiveListeners } from "@/hooks/use-passive-listeners"
import { useEffect } from "react"

interface PerformanceLayoutProps {
  children: React.ReactNode
}

export function PerformanceLayout({ children }: PerformanceLayoutProps) {
  usePassiveListeners()

  useEffect(() => {
    // Optimize main thread by deferring non-critical work
    const deferredTasks = () => {
      // Defer any heavy computations
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Non-critical work here
        })
      } else {
        setTimeout(() => {
          // Fallback for browsers without requestIdleCallback
        }, 1)
      }
    }

    deferredTasks()
  }, [])

  return <>{children}</>
}
