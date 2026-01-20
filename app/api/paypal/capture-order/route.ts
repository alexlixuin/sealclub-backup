import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createPayPalOrderRecord } from '@/lib/order-record'
import type { OrderData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, captureId, orderData } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'PayPal order ID is required' },
        { status: 400 }
      )
    }

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order data is required' },
        { status: 400 }
      )
    }

    // Capture the PayPal payment if we don't already have a capture ID
    let captureResult;
    if (!captureId) {
      captureResult = await capturePayPalOrder(orderId)
      
      // Check if payment was successful
      if (captureResult.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'PayPal payment was not completed' },
          { status: 400 }
        )
      }
    }

    // Get payment details
    const paymentDetails = captureResult?.purchase_units[0]?.payments?.captures?.[0] || { id: captureId }
    if (!paymentDetails?.id) {
      return NextResponse.json(
        { error: 'Payment details not found' },
        { status: 400 }
      )
    }

    // Create order in our database with PayPal payment info
    const enhancedOrderData: OrderData = {
      ...orderData,
      paymentMethod: 'paypal',
      paymentIntentId: orderId, // Store PayPal order ID
      paymentStatus: 'completed',
      paymentDetails: {
        paypalOrderId: orderId,
        paypalCaptureId: paymentDetails.id,
        paypalPayerEmail: captureResult?.payer?.email_address,
        paypalPayerId: captureResult?.payer?.payer_id,
      }
    }

    // Create order record
    const result = await createPayPalOrderRecord(enhancedOrderData)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      paypalOrderId: orderId,
      captureId: paymentDetails.id,
    })
  } catch (error) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' },
      { status: 500 }
    )
  }
}
