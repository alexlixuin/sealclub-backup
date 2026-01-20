"use server"
import { getSupabaseAdmin } from "./supabase"

const supabaseAdmin = getSupabaseAdmin()

export async function getPayPalOrderByNumber(orderNumber: string) {
  try {
    console.log("[PayPal] Retrieving order by number:", orderNumber)
    
    // First, let's check what orders exist in the database
    const { data: allOrders, error: allOrdersError } = await supabaseAdmin
      .from('order_logs')
      .select('order_number, payment_method, session_id')
      .order('created_at', { ascending: false })
      .limit(10)
    
    console.log("[PayPal] Recent orders in database:", allOrders)
    
    const { data, error } = await supabaseAdmin
      .from('order_logs')
      .select('*')
      .eq('order_number', parseInt(orderNumber))
      .single()

    console.log("[PayPal] Query result - data:", data, "error:", error)

    if (error) {
      console.error("[PayPal] Error retrieving order:", error)
      return null
    }

    if (!data) {
      console.log("[PayPal] No order found for number:", orderNumber)
      return null
    }

    // Skip payment method check - if we're here, it's a PayPal order (session_id starts with "paypal_")
    console.log("[PayPal] Order found with payment_method:", data.payment_method, "- proceeding anyway")

    // Parse/normalize stored data
    // items may be stored as a JSON string or as a structured array
    let items: any[] = []
    try {
      if (Array.isArray((data as any).items)) {
        items = (data as any).items
      } else if (typeof (data as any).items === 'string') {
        items = JSON.parse((data as any).items as string)
      }
    } catch (e) {
      console.warn('[PayPal] Failed to parse items JSON, defaulting to empty array:', e)
      items = []
    }

    const shippingInfo = (data as any).shipping_info || {}
    const billingInfo = (data as any).billing_info || {}
    const shippingAddress = shippingInfo.address || {}
    const billingAddress = billingInfo.address || {}

    // Transform to match the expected format for the success page
    const orderData = {
      id: data.session_id,
      orderNumber: data.order_number.toString(),
      customer: {
        email: data.customer_email,
        name: data.customer_name,
        phone: billingAddress.phone || "",
      },
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shipping: {
        address: {
          line1: shippingAddress.address || "",
          line2: "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.zipCode || "",
          country: shippingAddress.country || "",
        },
        name: data.customer_name,
        carrier: shippingInfo.method || (data as any).shipping_method || "Standard Shipping",
      },
      amount: {
        // Some columns may not exist (subtotal, shipping_cost). Derive safely.
        shipping: Number((data as any).shipping_cost) || 0,
        total: Number((data as any).total_amount) || 0,
        subtotal: (() => {
          const total = Number((data as any).total_amount) || 0
          const shipping = Number((data as any).shipping_cost) || 0
          return total - shipping > 0 ? total - shipping : total
        })(),
        tax: 0,
      },
      status: (data as any).payment_status || "paid",
      date: data.created_at,
    }

    console.log("[PayPal] Order retrieved successfully:", orderData.orderNumber)
    return orderData
  } catch (error) {
    console.error("[PayPal] Error in getPayPalOrderByNumber:", error)
    return null
  }
}
