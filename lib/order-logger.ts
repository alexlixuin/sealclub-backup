"use server"

import { createClientSafe } from "./supabase"
import { mapOrderToDbFormat, mapDbOrderToAppFormat } from "./order-utils"
import type { OrderLogData } from "./types"

// Function to get the next order number
export async function getNextOrderNumber(): Promise<number> {
  try {
    console.log("[v0] getNextOrderNumber: Starting to get next order number...")
    const supabase = createClientSafe()
    console.log("[v0] getNextOrderNumber: Supabase client created successfully")

    // Get the highest order number from the database
    const { data, error } = await supabase
      .from("order_logs")
      .select("order_number")
      .order("order_number", { ascending: false })
      .limit(1)

    if (error) {
      console.error("[v0] getNextOrderNumber: Error getting next order number:", error)
      // Start from 10000 if there's an error
      return 10000
    }

    console.log("[v0] getNextOrderNumber: Database query successful, data:", data)

    // If there are no orders yet, start from 10000
    if (!data || data.length === 0) {
      console.log("[v0] getNextOrderNumber: No existing orders, starting from 10000")
      return 10000
    }

    const nextOrderNumber = Number.parseInt(data[0].order_number.toString()) + 1
    console.log("[v0] getNextOrderNumber: Next order number calculated:", nextOrderNumber)

    // Return the next order number
    return nextOrderNumber
  } catch (error) {
    console.error("[v0] getNextOrderNumber: Caught error:", error)
    // Start from 10000 if there's an error
    return 10000
  }
}

// Function to log an order
export async function logOrder(orderData: any): Promise<void> {
  try {
    console.log("[v0] logOrder: Starting to log order...")
    console.log("[v0] logOrder: Raw order data:", JSON.stringify(orderData, null, 2))

    const supabase = createClientSafe()
    console.log("[v0] logOrder: Supabase client created successfully")

    // Convert to database format with error handling
    try {
      console.log("[v0] logOrder: Converting order data to database format...")
      const dbOrderData = mapOrderToDbFormat(orderData)
      console.log("[v0] logOrder: Mapped order data:", JSON.stringify(dbOrderData, null, 2))

      // Insert the order into the database
      console.log("[v0] logOrder: Inserting order into database...")
      const { error } = await supabase.from("order_logs").insert([dbOrderData])

      if (error) {
        console.error("[v0] logOrder: Error logging order to database:", error)
      } else {
        console.log("[v0] logOrder: Order successfully logged to database")
      }
    } catch (mappingError) {
      console.error("[v0] logOrder: Error mapping order data:", mappingError)

      // Fallback: Try to insert minimal order data
      console.log("[v0] logOrder: Attempting fallback order data insertion...")
      const fallbackOrderData = {
        order_number: orderData.order_number || orderData.orderNumber || Date.now(),
        session_id: orderData.session_id || orderData.sessionId || `session_${Date.now()}`,
        customer_email: "error@example.com",
        customer_name: "Error in Order Data",
        total_amount: 0,
        items: [],
        shipping_info: {},
        billing_info: {},
        payment_status: "error",
        metadata: {
          error: mappingError instanceof Error ? mappingError.message : "Unknown error",
          original_data: JSON.stringify(orderData),
        },
      }

      const { error } = await supabase.from("order_logs").insert([fallbackOrderData])
      if (error) {
        console.error("[v0] logOrder: Error logging fallback order data:", error)
      } else {
        console.log("[v0] logOrder: Fallback order data logged successfully")
      }
    }
  } catch (error) {
    console.error("[v0] logOrder: Caught error in logOrder:", error)
  }
}

// Function to log a checkout event
export async function logCheckoutEvent(eventName: string, eventData: any): Promise<void> {
  try {
    console.log(`[v0] logCheckoutEvent: Logging event '${eventName}'...`)
    console.log(`[v0] logCheckoutEvent: Event data:`, JSON.stringify(eventData, null, 2))

    const supabase = createClientSafe()
    console.log("[v0] logCheckoutEvent: Supabase client created successfully")

    // Insert the checkout event into the database
    const { error } = await supabase.from("checkout_logs").insert([
      {
        event: eventName, // For the "event" column
        data: eventData, // For the "data" column
      },
    ])

    if (error) {
      console.error(`[v0] logCheckoutEvent: Error logging checkout event '${eventName}':`, error)
    } else {
      console.log(`[v0] logCheckoutEvent: Event '${eventName}' logged successfully`)
    }
  } catch (error) {
    console.error(`[v0] logCheckoutEvent: Caught error in logCheckoutEvent for '${eventName}':`, error)
  }
}

// Update order status
export async function updateOrderStatus(
  orderNumber: string,
  status: string,
): Promise<{ success: boolean } | { error: string }> {
  try {
    const supabase = createClientSafe()

    // Log the update request
    await logCheckoutEvent("update_order_status_request", {
      orderNumber,
      status,
    })

    // Update the order status in Supabase
    const { error } = await supabase
      .from("order_logs")
      .update({ payment_status: status })
      .eq("order_number", orderNumber)

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    // LOG
    await logCheckoutEvent("update_order_status_success", {
      orderNumber,
      status,
    })

    console.log(`Order status updated to ${status} for order ${orderNumber}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)

    // LOG
    await logCheckoutEvent("update_order_status_error", {
      orderNumber,
      status,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return { error: "Failed to update order status." }
  }
}

// map between database and schemas
export async function mapDbOrderToOrderData(dbOrder: any): Promise<OrderLogData> {
  return mapDbOrderToAppFormat(dbOrder)
}
