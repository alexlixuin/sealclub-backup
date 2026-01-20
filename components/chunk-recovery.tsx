"use client"

import { useEffect } from "react"

function isChunkLoadError(error: any): boolean {
  if (!error) return false
  const msg = String(error?.message || error)
  const name = String((error as any)?.name || "")
  return (
    name === "ChunkLoadError" ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk") ||
    msg.includes("Failed to fetch dynamically imported module")
  )
}

function isHydrationError(error: any): boolean {
  if (!error) return false
  const msg = String(error?.message || error)
  // React 18+ hydration mismatch signature
  return (
    msg.includes("Hydration failed because the server rendered HTML didn't match the client") ||
    msg.includes("Hydration failed")
  )
}

async function clearSWAndCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.allSettled(regs.map((r) => r.unregister()))
    }
  } catch (e) {
    console.warn("SW unregister failed", e)
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys()
      await Promise.allSettled(keys.map((k) => caches.delete(k)))
    }
  } catch (e) {
    console.warn("Cache clear failed", e)
  }
}

export function ChunkRecovery() {
  useEffect(() => {
    let handledOnce = false

    const recover = async () => {
      if (handledOnce) return
      handledOnce = true

      const retried = sessionStorage.getItem("chunk-retry")
      if (!retried) {
        sessionStorage.setItem("chunk-retry", "1")
        // First attempt: hard reload with cache-busting param
        const url = new URL(window.location.href)
        url.searchParams.set("v", Date.now().toString())
        // Defer to next macrotask so we don't clash with hydration
        setTimeout(() => {
          window.location.replace(url.toString())
        }, 0)
        return
      }

      // Second attempt: clear SW and caches, then reload
      await clearSWAndCaches()
      sessionStorage.removeItem("chunk-retry")
      const url2 = new URL(window.location.href)
      url2.searchParams.set("v", Date.now().toString())
      setTimeout(() => {
        window.location.replace(url2.toString())
      }, 0)
    }

    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      const reason: any = (ev && (ev as any).reason) || undefined
      if (isChunkLoadError(reason) || isHydrationError(reason)) {
        ev.preventDefault?.()
        recover()
      }
    }

    const onError = (ev: ErrorEvent) => {
      if (isChunkLoadError(ev?.error) || isHydrationError(ev?.error)) {
        ev.preventDefault?.()
        recover()
      }
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection)
    window.addEventListener("error", onError)

    // Optional: proactively ping a known chunk path to detect 404 early
    // If it fails, trigger recover to refresh to the latest build
    try {
      const ping = fetch("/_next/static/chunks/webpack.js", { cache: "no-store" })
      ping.catch(() => {})
    } catch {}

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
      window.removeEventListener("error", onError)
    }
  }, [])

  return null
}

export default ChunkRecovery
