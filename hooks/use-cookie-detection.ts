"use client"

import { useState, useEffect } from "react"

export function useCookieDetection() {
  const [thirdPartyCookiesEnabled, setThirdPartyCookiesEnabled] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkThirdPartyCookies = async () => {
      try {
        // Method 1: Check if we can set a SameSite=None cookie
        const testCookieName = 'third_party_test_' + Date.now()
        document.cookie = `${testCookieName}=test; SameSite=None; Secure; path=/`
        
        // Check if the cookie was set
        const cookieSet = document.cookie.includes(testCookieName)
        
        // Clean up test cookie
        if (cookieSet) {
          document.cookie = `${testCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        }

        // Method 2: Check localStorage for previous user consent
        const previouslyAccepted = localStorage.getItem('third_party_cookies_enabled') === 'true'
        
        // Method 3: Try to detect browser cookie settings
        const hasStorageAccess = 'requestStorageAccess' in document
        let storageAccessGranted = false
        
        if (hasStorageAccess) {
          try {
            // Check if we already have storage access
            storageAccessGranted = await (document as any).hasStorageAccess()
          } catch (e) {
            // hasStorageAccess not supported or failed
            storageAccessGranted = false
          }
        }

        // Determine if third-party cookies are likely enabled
        const enabled = cookieSet || previouslyAccepted || storageAccessGranted
        
        setThirdPartyCookiesEnabled(enabled)
        setIsChecking(false)
      } catch (error) {
        console.warn('Cookie detection failed:', error)
        // Default to assuming cookies are disabled to be safe
        setThirdPartyCookiesEnabled(false)
        setIsChecking(false)
      }
    }

    checkThirdPartyCookies()
  }, [])

  const requestStorageAccess = async (): Promise<boolean> => {
    try {
      if ('requestStorageAccess' in document) {
        await (document as any).requestStorageAccess()
        setThirdPartyCookiesEnabled(true)
        localStorage.setItem('third_party_cookies_enabled', 'true')
        return true
      }
      return false
    } catch (error) {
      console.warn('Storage access request failed:', error)
      return false
    }
  }

  return {
    thirdPartyCookiesEnabled,
    isChecking,
    requestStorageAccess
  }
}
