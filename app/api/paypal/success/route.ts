import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createPayPalOrder } from '@/lib/paypal-order'
import { getPayPalOrderData, removePayPalOrderData } from '@/lib/paypal-storage'
import type { OrderData } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const payerId = searchParams.get('PayerID')

  console.log('PayPal success callback received:', {
    token,
    payerId
  })

  if (!token || !payerId) {
    console.error('Missing required PayPal parameters:', { token, payerId })
    return redirect('/checkout?error=missing_paypal_params')
  }

  let parsedOrderData: any = null
  let result: any = null

  try {
    // Get order data from database using token (PayPal order ID)
    parsedOrderData = await getPayPalOrderData(token)
    
    if (!parsedOrderData) {
      console.error('Missing order data for PayPal order:', token)
      return redirect('/checkout?error=missing_order_data')
    }

    // Create the order in our database using PayPal-specific function
    result = await createPayPalOrder(parsedOrderData)

    if (!result.success) {
      console.error('Failed to create PayPal order:', result.error)
      return redirect('/checkout?error=order_creation_failed')
    }

    console.log('PayPal order created successfully:', result.orderNumber)
    
    // Don't clean up stored order data immediately - let it expire naturally
  } catch (error) {
    console.error('PayPal success handler error:', error)
    return redirect('/checkout?error=processing_failed')
  }

  // Redirect to success page (outside try-catch to avoid catching NEXT_REDIRECT)
  return redirect(`/checkout/success?session_id=paypal_${result.orderNumber}&order_number=${result.orderNumber}&payment_method=paypal`)
}
