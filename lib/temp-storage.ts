// Temporary storage for PayPal order data
// In production, you should use Redis or a database
const orderDataStorage = new Map<string, any>()

export function storeOrderData(orderId: string, orderData: any): void {
  console.log('Storing order data for PayPal order ID:', orderId)
  orderDataStorage.set(orderId, {
    data: orderData,
    timestamp: Date.now(),
  })
  
  console.log('Current storage keys:', Array.from(orderDataStorage.keys()))
  
  // Clean up old entries (older than 1 hour)
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  for (const [key, value] of orderDataStorage.entries()) {
    if (value.timestamp < oneHourAgo) {
      orderDataStorage.delete(key)
    }
  }
}

export function getOrderData(orderId: string): any | null {
  console.log('Looking for order data with ID:', orderId)
  console.log('Available storage keys:', Array.from(orderDataStorage.keys()))
  
  const stored = orderDataStorage.get(orderId)
  if (!stored) {
    console.log('No stored data found for order ID:', orderId)
    return null
  }
  
  // Check if data is still valid (not older than 1 hour)
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  if (stored.timestamp < oneHourAgo) {
    console.log('Stored data expired for order ID:', orderId)
    orderDataStorage.delete(orderId)
    return null
  }
  
  console.log('Found valid stored data for order ID:', orderId)
  return stored.data
}

export function removeOrderData(orderId: string): void {
  orderDataStorage.delete(orderId)
}
