import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_NVP_ENDPOINT = 'https://api-3t.paypal.com/nvp'

export async function POST(request: NextRequest) {
  try {
    const { token, payerId } = await request.json()

    if (!token || !payerId) {
      return NextResponse.json({ error: 'Missing token or payerId' }, { status: 400 })
    }

    // PayPal NVP DoExpressCheckoutPayment parameters
    const nvpParams = new URLSearchParams({
      METHOD: 'DoExpressCheckoutPayment',
      VERSION: '124.0',
      USER: process.env.PAYPAL_NVP_USERNAME!,
      PWD: process.env.PAYPAL_NVP_PASSWORD!,
      SIGNATURE: process.env.PAYPAL_NVP_SIGNATURE!,
      TOKEN: token,
      PAYERID: payerId,
      PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
    })

    const response = await fetch(PAYPAL_NVP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: nvpParams.toString(),
    })

    const responseText = await response.text()
    const responseParams = new URLSearchParams(responseText)
    const ack = responseParams.get('ACK')
    
    if (ack === 'Success' || ack === 'SuccessWithWarning') {
      return NextResponse.json({
        success: true,
        transactionId: responseParams.get('PAYMENTINFO_0_TRANSACTIONID'),
        correlationId: responseParams.get('CORRELATIONID'),
        paymentStatus: responseParams.get('PAYMENTINFO_0_PAYMENTSTATUS'),
        amount: responseParams.get('PAYMENTINFO_0_AMT'),
      })
    } else {
      const errorCode = responseParams.get('L_ERRORCODE0')
      const errorMsg = responseParams.get('L_LONGMESSAGE0') || responseParams.get('L_SHORTMESSAGE0')
      
      return NextResponse.json({
        error: `PayPal Error: ${errorMsg}`,
        errorCode,
        details: responseText
      }, { status: 400 })
    }

  } catch (error) {
    console.error('PayPal NVP Execute Error:', error)
    return NextResponse.json(
      { error: 'Failed to execute PayPal payment' },
      { status: 500 }
    )
  }
}
