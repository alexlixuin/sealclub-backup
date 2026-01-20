'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export default function PayPalNVPSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const executePayment = async () => {
      try {
        const token = searchParams.get('token')
        const payerId = searchParams.get('PayerID')

        if (!token || !payerId) {
          throw new Error('Missing payment parameters')
        }

        // Get stored order data from localStorage
        const storedOrderData = localStorage.getItem('paypal-nvp-order-data')
        if (!storedOrderData) {
          throw new Error('Order data not found. Please try again.')
        }

        const orderData = JSON.parse(storedOrderData)

        // Execute the payment
        const response = await fetch('/api/paypal/nvp/execute-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            payerId,
            orderData,
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Clear stored order data
          localStorage.removeItem('paypal-nvp-order-data')
          localStorage.removeItem('checkout-form-data')

          toast({
            title: "Payment Successful!",
            description: `Transaction ID: ${result.transactionId}`,
            variant: "default",
          })

          // Redirect to success page
          router.push('/checkout/success')
        } else {
          throw new Error(result.error || 'Payment execution failed')
        }

      } catch (error) {
        console.error('PayPal NVP execution error:', error)
        setError(error instanceof Error ? error.message : 'Payment execution failed')
        setIsProcessing(false)
      }
    }

    executePayment()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Payment Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Processing Payment</h3>
        <p className="text-gray-300">Please wait while we complete your PayPal payment...</p>
      </div>
    </div>
  )
}
