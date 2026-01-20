"use client"

import { useEffect } from "react"
import { CRISP_CONFIG } from "@/lib/crisp-config"

// Declare the global Crisp object for TypeScript
declare global {
  interface Window {
    $crisp: any[]
    CRISP_WEBSITE_ID: string
  }
}

export function CrispChat() {
  useEffect(() => {
    // Initialize Crisp chat
    window.$crisp = []
    window.CRISP_WEBSITE_ID = CRISP_CONFIG.websiteId

    // Load the Crisp script
    const script = document.createElement("script")
    script.src = "https://client.crisp.chat/l.js"
    script.async = true
    document.head.appendChild(script)

    // Configure Crisp chat
    window.$crisp.push([
      "on",
      "session:loaded",
      () => {
        // Set theme color
        window.$crisp.push(["set", "chat:theme", CRISP_CONFIG.colors.theme])

        // Set position
        window.$crisp.push(["set", "chat:position", CRISP_CONFIG.position])

        // Set locale
        window.$crisp.push(["set", "session:locale", CRISP_CONFIG.locale])

        // Set welcome message
        window.$crisp.push(["set", "message:welcome", [CRISP_CONFIG.welcomeMessage]])
      },
    ])

    // Clean up
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null
}
