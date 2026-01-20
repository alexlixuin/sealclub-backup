import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { sendOrderConfirmationEmail } from "@/lib/email-service"
import { mapDbOrderToAppFormat } from "@/lib/order-utils"

export async function GET(request: Request) {
  try {
    console.log("🔍 [WEBHOOK-TEST] Webhook test endpoint called")

    // Get the order number from the query parameters
    const url = new URL(request.url)
    const orderNumber = url.searchParams.get("orderNumber")

    if (!orderNumber) {
      console.error("❌ [WEBHOOK-TEST] No order number provided")
      return NextResponse.json({ success: false, error: "Order number is required" }, { status: 400 })
    }

    console.log(`🔍 [WEBHOOK-TEST] Simulating webhook for order ${orderNumber}`)

    // Fetch the order from the database
    const supabase = createClient()
    const { data: order, error } = await supabase
      .from("order_logs")
      .select("*")
      .eq("order_number", orderNumber)
      .single()

    if (error || !order) {
      console.error(`❌ [WEBHOOK-TEST] Error fetching order: ${error?.message || "Order not found"}`)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    console.log(`✅ [WEBHOOK-TEST] Order found: ${order.order_number}`)

    // Update order status to paid
    const { error: updateError } = await supabase
      .from("order_logs")
      .update({ payment_status: "paid" })
      .eq("order_number", orderNumber)

    if (updateError) {
      console.error(`❌ [WEBHOOK-TEST] Error updating order status: ${updateError.message}`)
      return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 })
    }

    console.log(`✅ [WEBHOOK-TEST] Updated order status to paid`)

    try {
      // Convert DB order to OrderLogData
      console.log(`🔍 [WEBHOOK-TEST] Converting order data to app format`)
      const orderData = mapDbOrderToAppFormat(order)
      console.log(`✅ [WEBHOOK-TEST] Order data converted successfully`)

      // Send order confirmation email
      console.log(`🔍 [WEBHOOK-TEST] Sending order confirmation email to ${orderData.customerInfo.email}`)
      const emailResult = await sendOrderConfirmationEmail(orderData)

      if (emailResult.success) {
        console.log(`✅ [WEBHOOK-TEST] Order confirmation email sent successfully`)
      } else {
        console.error(`❌ [WEBHOOK-TEST] Failed to send order confirmation email:`, emailResult.error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to send email: ${emailResult.error?.message || "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } catch (emailError) {
      console.error(`❌ [WEBHOOK-TEST] Exception during email sending:`, emailError)
      return NextResponse.json(
        {
          success: false,
          error: `Exception during email sending: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: "Webhook test completed successfully" })
  } catch (error) {
    console.error("❌ [WEBHOOK-TEST] Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
