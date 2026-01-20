import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { sendOrderConfirmationEmail } from "@/lib/email-service"
import { mapDbOrderToAppFormat } from "@/lib/order-utils"

export async function GET(request: Request) {
  try {
    console.log("🔍 [MANUAL-EMAIL] Manual email trigger endpoint called")

    // Get the order number from the query parameters
    const url = new URL(request.url)
    const orderNumber = url.searchParams.get("orderNumber")

    if (!orderNumber) {
      console.error("❌ [MANUAL-EMAIL] No order number provided")
      return NextResponse.json({ success: false, error: "Order number is required" }, { status: 400 })
    }

    console.log(`🔍 [MANUAL-EMAIL] Fetching order details for order ${orderNumber}`)

    // Fetch the order from the database
    const supabase = createClient()
    const { data: order, error } = await supabase
      .from("order_logs")
      .select("*")
      .eq("order_number", orderNumber)
      .single()

    if (error || !order) {
      console.error(`❌ [MANUAL-EMAIL] Error fetching order: ${error?.message || "Order not found"}`)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    console.log(`✅ [MANUAL-EMAIL] Order found: ${order.order_number}`)

    try {
      // Convert DB order to OrderLogData
      console.log(`🔍 [MANUAL-EMAIL] Converting order data to app format`)
      const orderData = mapDbOrderToAppFormat(order)
      console.log(`✅ [MANUAL-EMAIL] Order data converted successfully`)

      // Send order confirmation email
      console.log(`🔍 [MANUAL-EMAIL] Sending order confirmation email to ${orderData.customerInfo.email}`)
      const emailResult = await sendOrderConfirmationEmail(orderData)

      if (emailResult.success) {
        console.log(`✅ [MANUAL-EMAIL] Order confirmation email sent successfully`)
        return NextResponse.json({ success: true, message: "Email sent successfully" })
      } else {
        console.error(`❌ [MANUAL-EMAIL] Failed to send order confirmation email:`, emailResult.error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to send email: ${emailResult.error?.message || "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } catch (emailError) {
      console.error(`❌ [MANUAL-EMAIL] Exception during email sending:`, emailError)
      return NextResponse.json(
        {
          success: false,
          error: `Exception during email sending: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ [MANUAL-EMAIL] Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
