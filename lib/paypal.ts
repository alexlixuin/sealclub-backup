// PayPal configuration
import { PAYPAL_TEST_MODE } from './paypal-config'

const PAYPAL_CLIENT_ID = PAYPAL_TEST_MODE
  ? process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_CLIENT_ID!
  : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!

const PAYPAL_CLIENT_SECRET = PAYPAL_TEST_MODE
  ? process.env.SANDBOX_PAYPAL_CLIENT_SECRET!
  : process.env.PAYPAL_CLIENT_SECRET!

const PAYPAL_BASE_URL = PAYPAL_TEST_MODE
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

// PayPal API helper functions
export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayPal Auth Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      clientId: PAYPAL_CLIENT_ID.substring(0, 10) + '...',
      baseUrl: PAYPAL_BASE_URL
    })
    throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export interface PayPalOrderRequest {
  intent: 'CAPTURE'
  purchase_units: Array<{
    amount: {
      currency_code: 'USD'
      value: string
    }
    description?: string
    custom_id?: string
  }>
  application_context?: {
    return_url?: string
    cancel_url?: string
    brand_name?: string
    user_action?: 'PAY_NOW' | 'CONTINUE'
  }
}

export async function createPayPalOrder(orderData: PayPalOrderRequest): Promise<any> {
  const accessToken = await getPayPalAccessToken()
  
  console.log('Creating PayPal order with data:', JSON.stringify(orderData, null, 2))
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayPal API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`Failed to create PayPal order: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken()
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayPal Capture Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      orderId: orderId
    })
    throw new Error(`Failed to capture PayPal order: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
