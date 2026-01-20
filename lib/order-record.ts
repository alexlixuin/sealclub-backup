"use server"
import type { OrderData, AddressType } from "./types"
import { getNextOrderNumber, logOrder, logCheckoutEvent } from "./order-logger"
import { recordAffiliateTransaction } from "./affiliate-service"
import { getDiscountByCode, recordDiscountUsage } from "./discount-service"

function validateAddress(address: AddressType): string | null {
  if (!address.address || address.address.trim() === "") return "Address is required"
  if (!address.city || address.city.trim() === "") return "City is required"
  if (!address.state || address.state.trim() === "") return "State is required"
  if (!address.zipCode || address.zipCode.trim() === "") return "ZIP code is required"
  if (!address.country || address.country.trim() === "") return "Country is required"
  return null
}

export async function createPayPalOrderRecord(orderData: OrderData) {
  try {
    console.log("[paypal] createPayPalOrderRecord: Starting order creation (no Stripe)...")

    // Validate addresses and contact
    const billingErr = validateAddress(orderData.customerInfo.billingAddress)
    if (billingErr) return { error: `Billing address error: ${billingErr}` }
    const shippingErr = validateAddress(orderData.customerInfo.shippingAddress)
    if (shippingErr) return { error: `Shipping address error: ${shippingErr}` }
    if (!orderData.customerInfo.email || !orderData.customerInfo.email.includes("@")) {
      return { error: "Valid email address is required" }
    }
    if (!orderData.customerInfo.phone) {
      return { error: "Phone number is required" }
    }

    // Log checkout start
    await logCheckoutEvent("checkout_started", {
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      customerName: orderData.customerInfo.name,
      items: orderData.items,
      total: orderData.total,
      discount: orderData.discount,
      isTestMode: false,
    })

    // Get order number
    const orderNumber = await getNextOrderNumber()

    // Log order to DB
    await logOrder({
      order_number: orderNumber,
      session_id: `paypal_${orderNumber}_${Date.now()}`,
      customer_email: orderData.customerInfo.email,
      customer_name: orderData.customerInfo.name,
      total_amount: orderData.total,
      items: orderData.items,
      howDidYouFindUs: orderData.howDidYouFindUs,
      shipping_info: {
        method: orderData.shippingMethod,
        address: orderData.customerInfo.shippingAddress,
      },
      billing_info: {
        address: orderData.customerInfo.billingAddress,
        phone: orderData.customerInfo.phone,
      },
      payment_status: "paid",
      is_test_order: false,
      metadata: {
        payment_method: "paypal",
        customer_phone: orderData.customerInfo.phone,
      },
    })

    // Affiliate
    if (orderData.affiliate) {
      try {
        await recordAffiliateTransaction(
          orderData.affiliate.affiliateCodeId,
          orderData.affiliate.affiliateId,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.total,
          orderData.affiliate.commissionRate,
        )
      } catch (e) {
        console.warn("[paypal] affiliate record warning:", e)
      }
    }

    // Discount
    if (orderData.discount) {
      const discount = await getDiscountByCode(orderData.discount.code)
      if (discount) {
        await recordDiscountUsage(
          discount.id,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.discount.amountSaved,
        )
      }
    }

    await logCheckoutEvent("order_created", {
      orderNumber,
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      paymentMethod: "paypal",
    })

    return { orderNumber, success: true }
  } catch (error) {
    console.error("[paypal] createPayPalOrderRecord error:", error)
    return { error: "Failed to create order record" }
  }
}
