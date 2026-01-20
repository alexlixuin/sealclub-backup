import type { OrderLogData, OrderLogDbData } from "./types"
import { addressToString } from "./address-utils"
import { STRIPE_TEST_MODE } from "./config"

/**
 * Map an order from the application format to the database format
 * with robust error handling for missing properties
 */
export function mapOrderToDbFormat(orderData: any): OrderLogDbData {
  // Add defensive checks to handle missing properties
  if (!orderData) {
    console.error("mapOrderToDbFormat: orderData is undefined or null")
    orderData = {}
  }

  console.log("mapOrderToDbFormat input:", JSON.stringify(orderData, null, 2))

  // Handle PayPal orders that pass addresses as JSON strings
  let shipping_info = orderData.shipping_info || {}
  let billing_info = orderData.billing_info || {}
  
  // For PayPal orders, parse shipping_address and billing_address JSON strings
  if (orderData.shipping_address && typeof orderData.shipping_address === 'string') {
    try {
      shipping_info = JSON.parse(orderData.shipping_address)
    } catch (e) {
      console.error('Error parsing shipping_address:', e)
    }
  }
  
  if (orderData.billing_address && typeof orderData.billing_address === 'string') {
    try {
      billing_info = JSON.parse(orderData.billing_address)
    } catch (e) {
      console.error('Error parsing billing_address:', e)
    }
  }

  // Ensure customerInfo exists
  const customerInfo = orderData.customerInfo || {}

  // Get phone from multiple possible locations
  const phone =
    billing_info.phone ||
    (billing_info.address && billing_info.address.phone) ||
    customerInfo.phone ||
    orderData.metadata?.customer_phone ||
    ""

  // When in test mode, all orders should be considered test orders
  const isTestOrder = STRIPE_TEST_MODE || orderData.is_test_order || false

  // Create the database order object
  const dbOrder = {
    order_number: orderData.orderNumber || orderData.order_number || Date.now(),
    session_id: orderData.sessionId || orderData.session_id || `session_${Date.now()}`,
    customer_email: customerInfo.email || orderData.customer_email || "no-email@example.com",
    customer_name: customerInfo.name || orderData.customer_name || "Unknown Customer",
    total_amount: orderData.total || orderData.total_amount || 0,
    items: orderData.items || [],
    // Preserve the original shipping_info structure if it exists
    shipping_info: shipping_info,
    // Preserve the original billing_info structure if it exists
    billing_info: {
      ...billing_info,
      phone: phone, // Ensure phone is included
    },
    payment_status: orderData.status || orderData.payment_status || "pending",
    how_did_you_find_us: orderData.howDidYouFindUs || orderData.how_did_you_find_us || null,
    is_test_order: isTestOrder,
    metadata: {
      ...orderData.metadata,
      is_test_mode: STRIPE_TEST_MODE,
    },
  }

  console.log("mapOrderToDbFormat output:", JSON.stringify(dbOrder, null, 2))
  return dbOrder
}

/**
 * Map an order from the database format to the application format
 */
export function mapDbOrderToAppFormat(dbOrder: any): OrderLogData {
  // Add defensive checks
  if (!dbOrder) {
    console.error("mapDbOrderToAppFormat: dbOrder is undefined or null")
    dbOrder = {}
  }

  console.log("mapDbOrderToAppFormat input:", JSON.stringify(dbOrder, null, 2))

  // Extract shipping and billing addresses
  const shippingAddress = dbOrder.shipping_info?.address || {}
  const billingAddress = dbOrder.billing_info?.address || {}

  // Pre-format addresses as strings to avoid rendering issues
  const shippingAddressString = addressToString(dbOrder.shipping_info || {})
  const billingAddressString = addressToString(dbOrder.billing_info || {})

  // Extract phone from billing_info - check all possible locations
  let phone = ""

  // Check all possible locations for phone number
  if (typeof dbOrder.billing_info === "object") {
    // Direct phone property in billing_info
    if (dbOrder.billing_info?.phone) {
      phone = dbOrder.billing_info.phone
      console.log("Found phone in billing_info.phone:", phone)
    }
    // Phone in address object
    else if (dbOrder.billing_info?.address?.phone) {
      phone = dbOrder.billing_info.address.phone
      console.log("Found phone in billing_info.address.phone:", phone)
    }
  }

  // Fallback to metadata
  if (!phone && dbOrder.metadata?.customer_phone) {
    phone = dbOrder.metadata.customer_phone
    console.log("Found phone in metadata.customer_phone:", phone)
  }

  console.log("Final extracted phone:", phone)

  const appOrder = {
    id: dbOrder.id || 0,
    orderNumber: dbOrder.order_number ? dbOrder.order_number.toString() : "0",
    sessionId: dbOrder.session_id || "",
    howDidYouFindUs: dbOrder.how_did_you_find_us || null,
    customerInfo: {
      email: dbOrder.customer_email || "",
      name: dbOrder.customer_name || "",
      phone: phone,
      // Include both formats
      shippingAddress,
      billingAddress,
      shippingAddressString,
      billingAddressString,
    },
    items: typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : (dbOrder.items || []),
    subtotal: dbOrder.total_amount || 0,
    shipping: 0,

    total: dbOrder.total_amount || 0,
    shippingMethod:
      typeof dbOrder.shipping_info === "object" && dbOrder.shipping_info?.method
        ? dbOrder.shipping_info.method
        : "Standard",
    status: dbOrder.payment_status || "pending",
    createdAt: dbOrder.created_at || new Date().toISOString(),
    updatedAt: dbOrder.updated_at || new Date().toISOString(),
    metadata: dbOrder.metadata || {},
    is_test_order: dbOrder.is_test_order || false,
    // Store raw data for direct access
    rawBillingInfo: dbOrder.billing_info || {},
    rawShippingInfo: dbOrder.shipping_info || {},
  }

  console.log("mapDbOrderToAppFormat output:", JSON.stringify(appOrder, null, 2))
  return appOrder
}

// Alias for backward compatibility
export const mapDbOrderToOrderData = mapDbOrderToAppFormat
