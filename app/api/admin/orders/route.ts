import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { mapDbOrderToAppFormat } from "@/lib/order-utils"

export async function GET() {
  try {
    const supabase = createClient()

    // Get all orders from the database with a high limit to ensure we get all records
    // and order by order_number in descending order to get the latest orders first
    const { data, error } = await supabase
      .from("order_logs")
      .select("*")
      .order("order_number", { ascending: false })
      .limit(100) // Increased limit to ensure we get all orders

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch orders" })
    }

    // Log the number of orders fetched and the latest order number
    console.log(`Fetched ${data.length} orders. Latest order number: ${data[0]?.order_number}`)

    // Debug: Log the raw data of the first order
    if (data.length > 0) {
      console.log("Raw order data from database:", JSON.stringify(data[0], null, 2))
    }

    // Map the database orders to the application format
    const orders = data.map((order) => {
      // Use the utility function to map database order to application format
      const mappedOrder = mapDbOrderToAppFormat(order)

      // Debug: Log the mapped data for the first order
      if (order.order_number === data[0]?.order_number) {
        console.log("Mapped order data:", JSON.stringify(mappedOrder, null, 2))
      }

      return mappedOrder
    })

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("Error in GET /api/admin/orders:", error)
    return NextResponse.json({ success: false, error: "Internal server error" })
  }
}
