import { getSupabaseAdmin } from './supabase'

const supabase = getSupabaseAdmin()

export async function storePayPalOrderData(paypalOrderId: string, orderData: any): Promise<void> {
  console.log('Storing PayPal order data in database for ID:', paypalOrderId)
  
  const { error } = await supabase
    .from('paypal_order_data')
    .upsert({
      paypal_order_id: paypalOrderId,
      order_data: orderData,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    })

  if (error) {
    console.error('Error storing PayPal order data:', error)
    throw new Error('Failed to store PayPal order data')
  }
  
  console.log('PayPal order data stored successfully')
}

export async function getPayPalOrderData(paypalOrderId: string): Promise<any | null> {
  console.log('Retrieving PayPal order data from database for ID:', paypalOrderId)
  
  const { data, error } = await supabase
    .from('paypal_order_data')
    .select('order_data, expires_at')
    .eq('paypal_order_id', paypalOrderId)
    .single()

  if (error) {
    console.log('No PayPal order data found for ID:', paypalOrderId)
    return null
  }

  // Check if data has expired
  if (new Date(data.expires_at) < new Date()) {
    console.log('PayPal order data expired for ID:', paypalOrderId)
    // Clean up expired data
    await supabase
      .from('paypal_order_data')
      .delete()
      .eq('paypal_order_id', paypalOrderId)
    return null
  }

  console.log('PayPal order data retrieved successfully')
  return data.order_data
}

export async function removePayPalOrderData(paypalOrderId: string): Promise<void> {
  console.log('Removing PayPal order data for ID:', paypalOrderId)
  
  const { error } = await supabase
    .from('paypal_order_data')
    .delete()
    .eq('paypal_order_id', paypalOrderId)

  if (error) {
    console.error('Error removing PayPal order data:', error)
  }
}
