import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { sendShippingConfirmationEmail } from "@/lib/email-service"
import { mapDbOrderToAppFormat } from "@/lib/order-utils" // Updated import
import type { ShippingUpdateData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderNumber, trackingCode, carrier, estimatedDelivery } = body

    if (!orderNumber || !trackingCode || !carrier) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch the order details
    const { data: dbOrder, error: orderError } = await supabase
      .from("order_logs")
      .select("*")
      .eq("order_number", orderNumber)
      .single()

    if (orderError || !dbOrder) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from("order_logs")
      .update({
        status: "shipped",
        metadata: {
          ...dbOrder.metadata,
          shipping: {
            trackingCode,
            carrier,
            estimatedDelivery,
            shippedAt: new Date().toISOString(),
          },
        },
      })
      .eq("order_number", orderNumber)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 })
    }

    // Convert DB order to OrderLogData
    const orderData = mapDbOrderToAppFormat(dbOrder)

    // Send shipping confirmation email
    const shippingData: ShippingUpdateData = {
      trackingCode,
      carrier,
      orderNumber,
      estimatedDelivery,
    }

    const emailResult = await sendShippingConfirmationEmail(orderData, shippingData)

    if (!emailResult.success) {
      console.error("Error sending shipping confirmation email:", emailResult.error)
      return NextResponse.json({
        success: true,
        message: "Order updated but failed to send email",
        emailError: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Shipping information updated and email sent",
    })
  } catch (error) {
    console.error("Error in shipping update API:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
