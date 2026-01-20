import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_NVP_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? 'https://api-3t.paypal.com/nvp'
  : 'https://api-3t.sandbox.paypal.com/nvp'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'USD', returnUrl, cancelUrl, items, customerInfo } = await request.json()

    if (!amount || !returnUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // PayPal NVP SetExpressCheckout parameters
    const nvpParams = new URLSearchParams({
      METHOD: 'SetExpressCheckout',
      VERSION: '124.0',
      USER: process.env.PAYPAL_NVP_USERNAME!,
      PWD: process.env.PAYPAL_NVP_PASSWORD!,
      SIGNATURE: process.env.PAYPAL_NVP_SIGNATURE!,
      PAYMENTREQUEST_0_AMT: amount.toString(),
      PAYMENTREQUEST_0_CURRENCYCODE: currency,
      PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
      RETURNURL: returnUrl,
      CANCELURL: cancelUrl,
      NOSHIPPING: '1',
      ALLOWNOTE: '1',
      BRANDNAME: 'OZPTides',
      LOGOIMG: 'https://ozptides.com/logo.png',
      CARTBORDERCOLOR: '000000',
      PAYMENTREQUEST_0_DESC: 'OZPTides Order',
    })

    // Add item details if provided
    if (items && items.length > 0) {
      items.forEach((item: any, index: number) => {
        nvpParams.append(`L_PAYMENTREQUEST_0_NAME${index}`, item.name)
        nvpParams.append(`L_PAYMENTREQUEST_0_AMT${index}`, item.price.toString())
        nvpParams.append(`L_PAYMENTREQUEST_0_QTY${index}`, item.quantity.toString())
        nvpParams.append(`L_PAYMENTREQUEST_0_DESC${index}`, item.description || '')
      })
    }

    // Add customer info if provided
    if (customerInfo) {
      if (customerInfo.email) {
        nvpParams.append('EMAIL', customerInfo.email)
      }
      if (customerInfo.name) {
        const nameParts = customerInfo.name.split(' ')
        nvpParams.append('PAYMENTREQUEST_0_SHIPTONAME', customerInfo.name)
        if (nameParts.length >= 2) {
          nvpParams.append('FIRSTNAME', nameParts[0])
          nvpParams.append('LASTNAME', nameParts.slice(1).join(' '))
        }
      }
      if (customerInfo.shippingAddress) {
        const addr = customerInfo.shippingAddress
        nvpParams.append('PAYMENTREQUEST_0_SHIPTOSTREET', addr.address)
        nvpParams.append('PAYMENTREQUEST_0_SHIPTOCITY', addr.city)
        nvpParams.append('PAYMENTREQUEST_0_SHIPTOSTATE', addr.state)
        nvpParams.append('PAYMENTREQUEST_0_SHIPTOZIP', addr.zipCode)
        nvpParams.append('PAYMENTREQUEST_0_SHIPTOCOUNTRYCODE', addr.country)
      }
    }

    console.log('PayPal NVP Request:', nvpParams.toString())

    const response = await fetch(PAYPAL_NVP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: nvpParams.toString(),
    })

    const responseText = await response.text()
    console.log('PayPal NVP Response:', responseText)

    // Parse NVP response
    const responseParams = new URLSearchParams(responseText)
    const ack = responseParams.get('ACK')
    
    if (ack === 'Success' || ack === 'SuccessWithWarning') {
      const token = responseParams.get('TOKEN')
      const checkoutUrl = process.env.NODE_ENV === 'production'
        ? `https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${token}`
        : `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${token}`

      return NextResponse.json({
        success: true,
        token,
        checkoutUrl,
        correlationId: responseParams.get('CORRELATIONID'),
      })
    } else {
      const errorCode = responseParams.get('L_ERRORCODE0')
      const errorMsg = responseParams.get('L_LONGMESSAGE0') || responseParams.get('L_SHORTMESSAGE0')
      
      console.error('PayPal NVP Error:', { errorCode, errorMsg, response: responseText })
      
      return NextResponse.json({
        error: `PayPal Error: ${errorMsg}`,
        errorCode,
        details: responseText
      }, { status: 400 })
    }

  } catch (error) {
    console.error('PayPal NVP API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal payment' },
      { status: 500 }
    )
  }
}
