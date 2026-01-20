import { Resend } from "resend"
import type { OrderLogData } from "./types"
import type { CartItem } from "@/components/cart-provider"
import { getProductById } from "./products"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Domain for sending emails
const DOMAIN = process.env.EMAIL_DOMAIN || "sealclubbeauty.com"
const FROM_EMAIL = `no-reply@${DOMAIN}`

export type ShippingUpdateData = {
  trackingCode: string
  carrier: string
  orderNumber: string
  estimatedDelivery?: string
}

export async function sendOrderConfirmationEmail(order: OrderLogData) {
  try {
    // Map order items to include product details while preserving all CartItem properties
    const orderItems = order.items.map((item: CartItem) => {
      const product = getProductById(item.id)
      return {
        ...item, // Keep all original properties (id, name, price, quantity)
        image: product?.image || item.image,
      }
    })

    // Dynamically import the email template to avoid circular dependencies
    const { getOrderConfirmationEmailHtml } = await import("./email-templates")

    // Create a new order object with the updated items
    const orderWithUpdatedItems: OrderLogData = {
      ...order,
      items: orderItems,
    }

    // Send the email
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerInfo.email,
      subject: `Order Confirmation #${order.orderNumber} - SealClub Beauty`,
      html: getOrderConfirmationEmailHtml(orderWithUpdatedItems),
    })

    console.log("Order confirmation email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    return { success: false, error }
  }
}

export async function sendShippingConfirmationEmail(order: OrderLogData, shippingData: ShippingUpdateData) {
  try {
    // Map order items to include product details while preserving all CartItem properties
    const orderItems = order.items.map((item: CartItem) => {
      const product = getProductById(item.id)
      return {
        ...item, // Keep all original properties (id, name, price, quantity)
        image: product?.image || item.image,
      }
    })

    // Create a new order object with the updated items
    const orderWithUpdatedItems: OrderLogData = {
      ...order,
      items: orderItems,
    }

    // Dynamically import the email template to avoid circular dependencies
    const { getShippingConfirmationEmailHtml } = await import("./email-templates")

    // Map the shipping data to match the expected format (code instead of trackingCode)
    const trackingInfo = {
      code: shippingData.trackingCode,
      carrier: shippingData.carrier,
    }

    // Send the email
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerInfo.email,
      subject: `Your Order #${order.orderNumber} Has Shipped - SealClub Beauty`,
      html: getShippingConfirmationEmailHtml(orderWithUpdatedItems, trackingInfo),
    })

    console.log("Shipping confirmation email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Failed to send shipping confirmation email:", error)
    return { success: false, error }
  }
}
