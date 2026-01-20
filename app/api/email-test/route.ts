import { NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email-service"
import { createClient } from "@/lib/supabase"
import { mapDbOrderToAppFormat } from "@/lib/order-utils"

export async function GET(request: Request) {
  try {
    // Get order number from query params
    const url = new URL(request.url)
    const orderNumber = url.searchParams.get("orderNumber")

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    console.log(`🔍 [EMAIL-TEST] Testing email for order ${orderNumber}`)

    // Fetch the order from the database
    const supabase = createClient()
    const { data: order, error } = await supabase
      .from("order_logs")
      .select("*")
      .eq("order_number", orderNumber)
      .single()

    if (error || !order) {
      console.error(`❌ [EMAIL-TEST] Error fetching order: ${error?.message || "Order not found"}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log(`✅ [EMAIL-TEST] Order found: ${order.order_number}`)

    // Convert DB order to app format
    const orderData = mapDbOrderToAppFormat(order)

    // Send test email
    console.log(`🔍 [EMAIL-TEST] Sending test email to ${orderData.customerInfo.email}`)
    const result = await sendOrderConfirmationEmail(orderData)

    if (result.success) {
      console.log(`✅ [EMAIL-TEST] Test email sent successfully`)
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        emailId: result.data?.id,
        recipient: orderData.customerInfo.email,
      })
    } else {
      console.error(`❌ [EMAIL-TEST] Failed to send test email:`, result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(`❌ [EMAIL-TEST] Exception during test:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
