"use client"

import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { loadScript } from "@paypal/paypal-js"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/components/cart-provider"
import { useRouter } from "next/navigation"
import type { OrderData } from "@/lib/types"

interface PayPalCheckoutProps {
  finalTotal: number
  items: any[]
  formData: any
  shippingCost: number
  subtotal: number
  shippingMethod: any
  affiliate: any
  setIsSubmitting: (value: boolean) => void
}

function PayPalButtonsWrapper({
  finalTotal,
  items,
  formData,
  shippingCost,
  subtotal,
  shippingMethod,
  affiliate,
  setIsSubmitting
}: PayPalCheckoutProps) {
  const [state] = usePayPalScriptReducer()
  const { isPending, isResolved, isRejected } = state as any
  const [isProcessing, setIsProcessing] = useState(false)
  const [buttonsReady, setButtonsReady] = useState(false)
  const { toast } = useToast()
  const { clearCart } = useCart()
  const router = useRouter()

  // Helpers: pick first non-empty value and normalize address objects
  const firstNonEmpty = (...vals: any[]) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim().length > 0) return String(v).trim()
    }
    return ''
  }

  const buildNormalizedShipping = () => ({
    address: formData.shippingAddress,
    city: formData.shippingCity,
    state: formData.shippingState,
    zipCode: firstNonEmpty(
      formData.shippingPostalCode,
      formData.shippingPostcode,
      formData.shippingZip,
      formData.shippingZipCode,
      formData.postalCode,
      formData.postcode,
      formData.zipCode,
      formData.zip
    ),
    country: (formData.shippingCountry || '').toUpperCase(),
  })

  const buildNormalizedBilling = () => ({
    address: firstNonEmpty(formData.billingAddress, formData.shippingAddress),
    city: firstNonEmpty(formData.billingCity, formData.shippingCity),
    state: firstNonEmpty(formData.billingState, formData.shippingState),
    zipCode: firstNonEmpty(
      formData.billingPostalCode,
      formData.billingPostcode,
      formData.billingZip,
      formData.billingZipCode,
      formData.shippingPostalCode,
      formData.shippingPostcode,
      formData.shippingZip,
      formData.shippingZipCode,
      formData.postalCode,
      formData.postcode,
      formData.zipCode,
      formData.zip
    ),
    country: (firstNonEmpty(formData.billingCountry, formData.shippingCountry) || '').toUpperCase(),
  })

  // Ensure the PayPal Buttons class is available before rendering <PayPalButtons />
  useEffect(() => {
    let mounted = true
    const check = () => {
      const w: any = typeof window !== 'undefined' ? window : undefined
      const nsBtn = w?.ozp_paypal?.Buttons // in case a custom namespace was used previously
      const defBtn = w?.paypal?.Buttons
      const btn = nsBtn || defBtn
      const ready = typeof btn === 'function'
      if (mounted) setButtonsReady(!!ready)
    }
    check()
    const id = setInterval(check, 200)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  // Fallback: if the provider resolved but Buttons still not present, try loading via @paypal/paypal-js
  useEffect(() => {
    // Avoid running on server
    if (typeof window === 'undefined') return
    if (!isResolved || buttonsReady) return

    const opts: any = (state && (state as any).options) || undefined
    const envClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientId = (opts && opts.clientId) || envClientId
    if (!clientId) {
      console.error('[PayPal] Missing clientId in provider options and env. Cannot load SDK.')
      return
    }

    const load = async () => {
      try {
        console.debug('[PayPal] Provider resolved but Buttons missing. Loading SDK via fallback...', opts)
        await loadScript({
          clientId,
          currency: opts.currency || 'USD',
          intent: (opts as any).intent || 'capture',
          components: 'buttons,marks,messages',
          disableFunding: opts.disableFunding,
        })
        // After load, mark as ready if Buttons exists
        const w: any = window
        if (typeof (w?.paypal?.Buttons) === 'function') {
          setButtonsReady(true)
        }
      } catch (e) {
        console.error('[PayPal] Fallback SDK load failed:', e)
      }
    }

    // small delay to let provider inject first
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [isResolved, buttonsReady, state])

  const createOrder = async () => {
    try {
      setIsProcessing(true)
      setIsSubmitting(true)

      // Prepare order data (normalize missing billing fields to shipping and map various field names)
      const normalizedBilling = buildNormalizedBilling()
      const normalizedShipping = buildNormalizedShipping()
      const orderData: OrderData = {
        items: items,
        subtotal: subtotal,
        shipping: shippingCost,
        total: finalTotal,
        discount: null,
        affiliate: affiliate || null,
        shippingMethod: shippingMethod?.name || 'Standard',
        howDidYouFindUs: formData.howDidYouFindUs,
        paymentMethod: 'paypal',
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: normalizedShipping,
          billingAddress: normalizedBilling,
        },
      }

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal.toFixed(2),
          description: `OZPTides Order - ${items.length} item(s)`,
          customId: `order_${Date.now()}`,
          orderData: orderData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create PayPal order')
      }

      const order = await response.json()
      return order.id
    } catch (error) {
      console.error('PayPal create order error:', error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create PayPal order",
        variant: "destructive",
      })
      setIsProcessing(false)
      setIsSubmitting(false)
      throw error
    }
  }

  const onApprove = async (data: any, actions: any) => {
    try {
      setIsProcessing(true)
      setIsSubmitting(true)

      // First, capture the payment
      const captureResponse = await actions.order.capture()
      
      // Verify the capture was successful
      if (captureResponse.status !== 'COMPLETED') {
        throw new Error('Payment capture was not completed')
      }

      // Prepare order data for our database
      const normalizedBillingCapture = buildNormalizedBilling()
      const normalizedShippingCapture = buildNormalizedShipping()
      
      const orderData: OrderData = {
        items: items,
        subtotal: subtotal,
        shipping: shippingCost,
        total: finalTotal,
        discount: null,
        affiliate: affiliate || null,
        shippingMethod: shippingMethod?.name || 'Standard',
        howDidYouFindUs: formData.howDidYouFindUs,
        paymentMethod: 'paypal',
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: normalizedShippingCapture,
          billingAddress: normalizedBillingCapture,
        },
      }

      // Save order to our database
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          captureId: captureResponse.purchase_units[0]?.payments?.captures?.[0]?.id,
          orderData: orderData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process PayPal payment')
      }

      const result = await response.json()
      
      // Clear cart and redirect to success page
      clearCart()
      
      // Create session ID for success page (PayPal format)
      const sessionId = `paypal_${data.orderID}`
      
      router.push(`/checkout/success?session_id=${sessionId}&order_number=${result.orderNumber}`)
      
      toast({
        title: "Payment Successful!",
        description: `Order ${result.orderNumber} has been placed successfully.`,
      })

    } catch (error) {
      console.error('PayPal capture error:', error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process PayPal payment",
        variant: "destructive",
      })
      setIsProcessing(false)
      setIsSubmitting(false)
    }
  }

  const onError = (err: any) => {
    console.error('PayPal error:', err)
    toast({
      title: "Payment Error",
      description: "An error occurred with PayPal. Please try again or use a different payment method.",
      variant: "destructive",
    })
    setIsProcessing(false)
    setIsSubmitting(false)
  }

  const onCancel = () => {
    toast({
      title: "Payment Cancelled",
      description: "PayPal payment was cancelled. You can try again or use a different payment method.",
      variant: "destructive",
    })
    setIsProcessing(false)
    setIsSubmitting(false)
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-400">Loading PayPal...</span>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
        <p className="text-red-200 text-sm">
          Failed to load PayPal. Please refresh the page or try a different payment method.
        </p>
      </div>
    )
  }

  if (!isResolved) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
        <p className="text-yellow-200 text-sm">
          PayPal is still loading. Please wait...
        </p>
      </div>
    )
  }

  if (!buttonsReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-400">Preparing PayPal buttons...</span>
      </div>
    )
  }

  return (
    <div className="w-full paypal-button-stretch">
      <PayPalButtons
        className="w-full"
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
          tagline: false,
        }}
        forceReRender={[finalTotal, subtotal, shippingCost, formData?.billingCountry, formData?.shippingCountry]}
        disabled={isProcessing || finalTotal <= 0}
        onInit={() => {
          const w: any = typeof window !== 'undefined' ? window : undefined
          console.debug('[PayPal] Buttons onInit. window.paypal.Buttons is', typeof w?.paypal?.Buttons)
          if (typeof w?.paypal?.Buttons === 'function') {
            setButtonsReady(true)
          }
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />
      {/* Force the PayPal button container to span the full width of its parent */}
      <style jsx global>{`
        /* Stretch PayPal buttons to fill the container */
        .paypal-button-stretch .paypal-buttons,
        .paypal-button-stretch .paypal-button-row,
        .paypal-button-stretch .paypal-button-container,
        .paypal-button-stretch .paypal-button {
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
        }
        .paypal-button-stretch .paypal-button iframe,
        .paypal-button-stretch .paypal-buttons iframe {
          width: 100% !important;
          min-width: 100% !important;
        }
      `}</style>
      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Processing payment...
          </div>
        </div>
      )}
    </div>
  )
}

export function PayPalCheckout(props: PayPalCheckoutProps) {
  // The PayPalScriptProvider is provided at the page level (app/checkout/page.tsx)
  // Here we only render the Buttons wrapper.
  return <PayPalButtonsWrapper {...props} />
}
