"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Bug, Copy, Check } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { STRIPE_TEST_MODE } from "@/lib/config"

interface CheckoutDebugButtonProps {
  formData: any
  errors: any
  isProcessing: boolean
  stripeInitialized: boolean
  finalTotal: number
}

export function CheckoutDebugButton({ 
  formData, 
  errors, 
  isProcessing, 
  stripeInitialized, 
  finalTotal 
}: CheckoutDebugButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { items, subtotal, discount, affiliate, total, shippingMethod, shippingCost } = useCart()

  const collectDebugInfo = () => {
    const debugInfo = {
      // Timestamp
      timestamp: new Date().toISOString(),
      
      // Browser Information
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        vendor: navigator.vendor,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,
      },

      // Screen Information
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      },

      // Window Information
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio,
        isSecureContext: window.isSecureContext,
        origin: window.location.origin,
        protocol: window.location.protocol,
        host: window.location.host,
      },

      // Stripe Configuration
      stripe: {
        testMode: STRIPE_TEST_MODE,
        initialized: stripeInitialized,
        publishableKeyExists: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        testPublishableKeyExists: !!process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      },

      // Form State
      form: {
        isProcessing,
        hasErrors: Object.keys(errors).length > 0,
        errorFields: Object.keys(errors),
        errors: errors,
        formData: {
          ...formData,
          // Mask sensitive data
          email: formData.email ? `${formData.email.substring(0, 3)}***@${formData.email.split('@')[1]}` : '',
          phone: formData.phone ? `***-***-${formData.phone.slice(-4)}` : '',
          firstName: formData.firstName ? `${formData.firstName.charAt(0)}***` : '',
          lastName: formData.lastName ? `${formData.lastName.charAt(0)}***` : '',
          shippingAddress: formData.shippingAddress ? `${formData.shippingAddress.substring(0, 10)}***` : '',
          billingAddress: formData.billingAddress ? `${formData.billingAddress.substring(0, 10)}***` : '',
        },
      },

      // Cart Information
      cart: {
        itemCount: items.length,
        subtotal,
        shippingCost,
        finalTotal,
        total,
        hasDiscount: !!discount,
        discountCode: discount?.code || null,
        discountAmount: discount?.amountSaved || 0,
        hasAffiliate: !!affiliate,
        affiliateCode: affiliate?.code || null,
        shippingMethod: shippingMethod.name,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },

      // Network Information (if available)
      network: {
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
          saveData: (navigator as any).connection.saveData,
        } : 'Not available',
      },

      // Console Errors (last 10)
      consoleErrors: getRecentConsoleErrors(),

      // Local Storage Info
      localStorage: {
        available: typeof(Storage) !== "undefined",
        itemCount: localStorage ? localStorage.length : 0,
      },

      // Session Storage Info
      sessionStorage: {
        available: typeof(Storage) !== "undefined",
        itemCount: sessionStorage ? sessionStorage.length : 0,
      },

      // Feature Detection
      features: {
        fetch: typeof fetch !== 'undefined',
        Promise: typeof Promise !== 'undefined',
        WebCrypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
        IntersectionObserver: typeof IntersectionObserver !== 'undefined',
        ResizeObserver: typeof ResizeObserver !== 'undefined',
        PaymentRequest: typeof PaymentRequest !== 'undefined',
      },

      // Timezone
      timezone: {
        offset: new Date().getTimezoneOffset(),
        name: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    return debugInfo
  }

  const getRecentConsoleErrors = () => {
    // This is a simplified version - in a real implementation you'd need to 
    // capture console errors as they happen
    try {
      return "Console error capture not implemented - check browser console manually"
    } catch (e) {
      return "Could not access console errors"
    }
  }

  const handleCopyDebugInfo = async () => {
    try {
      const debugInfo = collectDebugInfo()
      const debugText = `
=== OZPTIDES CHECKOUT DEBUG INFO ===
Generated: ${debugInfo.timestamp}

BROWSER INFO:
${JSON.stringify(debugInfo.browser, null, 2)}

SCREEN INFO:
${JSON.stringify(debugInfo.screen, null, 2)}

STRIPE CONFIG:
${JSON.stringify(debugInfo.stripe, null, 2)}

FORM STATE:
${JSON.stringify(debugInfo.form, null, 2)}

CART INFO:
${JSON.stringify(debugInfo.cart, null, 2)}

NETWORK INFO:
${JSON.stringify(debugInfo.network, null, 2)}

FEATURES:
${JSON.stringify(debugInfo.features, null, 2)}

TIMEZONE:
${JSON.stringify(debugInfo.timezone, null, 2)}

CONSOLE ERRORS:
${debugInfo.consoleErrors}

=== END DEBUG INFO ===

Instructions: Send this debug info to support@ozptides.com with a description of the issue you're experiencing.
      `.trim()

      await navigator.clipboard.writeText(debugText)
      setCopied(true)
      toast({
        title: "Debug Info Copied!",
        description: "Debug information has been copied to clipboard. Send this to  support@ozptides.com",
        duration: 5000,
      })

      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error("Failed to copy debug info:", error)
      toast({
        title: "Copy Failed",
        description: "Could not copy debug info. Please check browser console.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyDebugInfo}
        className="bg-background/80 backdrop-blur-sm border-muted hover:bg-muted/50 text-xs gap-1.5 shadow-lg"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Bug className="h-3 w-3" />
            Debug Info
          </>
        )}
      </Button>
    </div>
  )
}
