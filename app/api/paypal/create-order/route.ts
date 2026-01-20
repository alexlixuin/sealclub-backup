import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal'
import type { PayPalOrderRequest } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, customId } = body

    if (!amount || typeof amount !== 'string') {
      return NextResponse.json(
        { error: 'Amount is required and must be a string' },
        { status: 400 }
      )
    }

    const orderRequest: PayPalOrderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          description: description || 'OZPTides Order',
          custom_id: customId,
        },
      ],
      application_context: {
        brand_name: 'OZPTides',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      },
    }

    const paypalOrder = await createPayPalOrder(orderRequest)
    
    return NextResponse.json({
      id: paypalOrder.id,
      status: paypalOrder.status,
      links: paypalOrder.links,
    })
  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
