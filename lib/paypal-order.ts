"use server"
import type { OrderData } from "./types"
import { getNextOrderNumber, logOrder, logCheckoutEvent } from "./order-logger"
import { getSupabaseAdmin } from "./supabase"
import { recordAffiliateTransaction } from "./affiliate-service"
import { recordDiscountUsage } from "./discount-service"

const supabaseAdmin = getSupabaseAdmin()

export async function createPayPalOrder(orderData: OrderData) {
  try {
    console.log("[PayPal] createPayPalOrder: Starting PayPal order creation process...")
    console.log("[PayPal] createPayPalOrder: Received data:", JSON.stringify(orderData, null, 2))

    // Log the start of the checkout process
    console.log("[PayPal] createPayPalOrder: Logging checkout started event...")
    await logCheckoutEvent("checkout_started", {
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      customerName: orderData.customerInfo.name,
      items: orderData.items,
      total: orderData.total,
      discount: orderData.discount,
      isTestMode: false, // PayPal orders are always live
    })

    // Get the next order number
    console.log("[PayPal] createPayPalOrder: Getting next order number...")
    const orderNumber = await getNextOrderNumber()
    console.log("[PayPal] createPayPalOrder: Order number assigned:", orderNumber)

    // Log the order to Supabase
    console.log("[PayPal] createPayPalOrder: Logging order to database...")
    await logOrder({
      order_number: orderNumber,
      session_id: `paypal_${Date.now()}`, // Generate a unique session ID for PayPal
      customer_email: orderData.customerInfo.email,
      customer_phone: orderData.customerInfo.phone,
      customer_name: orderData.customerInfo.name,
      shipping_address: JSON.stringify(orderData.customerInfo.shippingAddress),
      billing_address: JSON.stringify(orderData.customerInfo.billingAddress),
      items: JSON.stringify(orderData.items),
      subtotal: orderData.subtotal.toString(),
      shipping_cost: orderData.shipping.toString(),
      total: orderData.total.toString(),
      payment_method: "paypal",
      shipping_method: orderData.shippingMethod,
      how_did_you_find_us: orderData.howDidYouFindUs,
      order_metadata: {
        affiliate_id: orderData.affiliate?.affiliateId || null,
        affiliate_code_id: orderData.affiliate?.affiliateCodeId || null,
        commission_rate: orderData.affiliate?.commissionRate || null,
        discount_code: orderData.discount?.code || null,
        discount_amount: orderData.discount ? orderData.discount.amountSaved.toString() : "0",
      },
    })
    console.log("[PayPal] createPayPalOrder: Order logged successfully")

    // Record affiliate transaction if an affiliate code was used
    if (orderData.affiliate) {
      console.log("[PayPal] createPayPalOrder: Recording affiliate transaction...")
      try {
        await recordAffiliateTransaction(
          orderData.affiliate.affiliateCodeId,
          orderData.affiliate.affiliateId,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.total,
          orderData.affiliate.commissionRate
        )
        console.log("[PayPal] createPayPalOrder: Affiliate transaction recorded successfully")
      } catch (affiliateError) {
        console.error("[PayPal] createPayPalOrder: Error recording affiliate transaction:", affiliateError)
        // Don't fail the entire order for affiliate errors
      }
    }

    // Record discount usage if a discount was applied
    if (orderData.discount) {
      console.log("[PayPal] createPayPalOrder: Recording discount usage...")
      try {
        await recordDiscountUsage(
          orderData.discount.code,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.discount.amountSaved
        )
        console.log("[PayPal] createPayPalOrder: Discount usage recorded successfully")
      } catch (discountError) {
        console.error("[PayPal] createPayPalOrder: Error recording discount usage:", discountError)
        // Don't fail the entire order for discount errors
      }
    }

    // Log successful completion
    await logCheckoutEvent("checkout_completed", {
      orderNumber: orderNumber,
      customerEmail: orderData.customerInfo.email,
      total: orderData.total,
      paymentMethod: "paypal",
      isTestMode: false,
    })

    console.log("[PayPal] createPayPalOrder: Order creation completed successfully")
    console.log("[PayPal] createPayPalOrder: Order Number:", orderNumber)

    return { orderNumber, success: true }
  } catch (error) {
    console.error("[PayPal] createPayPalOrder: Error creating order:", error)

    // Log the error
    await logCheckoutEvent("checkout_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderData: orderData,
      isTestMode: false,
    })

    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}
