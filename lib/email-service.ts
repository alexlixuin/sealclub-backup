import { Resend } from "resend"
import type { OrderLogData, ShippingUpdateData, EmailResult } from "@/lib/types"
import { EMAIL_DOMAIN } from "./config"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Send order confirmation email
export async function sendOrderConfirmationEmail(orderData: OrderLogData): Promise<EmailResult> {
  console.log("🔍 [EMAIL-SERVICE] Attempting to send order confirmation email", {
    orderNumber: orderData.orderNumber,
    customerEmail: orderData.customerInfo.email,
    resendApiKey: process.env.RESEND_API_KEY
      ? "Set (first 4 chars: " + process.env.RESEND_API_KEY.substring(0, 4) + ")"
      : "NOT SET",
    emailDomain: EMAIL_DOMAIN || "NOT SET",
  })

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ [EMAIL-SERVICE] RESEND_API_KEY is not set")
    return {
      success: false,
      error: new Error("RESEND_API_KEY environment variable is not set"),
    }
  }

  try {
    // Create a simple HTML email
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333;">SealClub Beauty</h1>
            </div>
            <h1 style="color: #333;">Order Confirmation</h1>
            <p>Thank you for your order! We've received your order and are processing it now.</p>
            <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h2 style="margin-top: 30px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Item</th>
                <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
              ${orderData.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
                  <td style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                  <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
              <tr>
                <td colspan="2" style="text-align: right; padding: 10px;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; padding: 10px;">$${orderData.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right; padding: 10px;"><strong>Shipping:</strong></td>
                <td style="text-align: right; padding: 10px;">$${orderData.shipping.toFixed(2)}</td>
              </tr>

              <tr>
                <td colspan="2" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                <td style="text-align: right; padding: 10px;"><strong>$${orderData.total.toFixed(2)}</strong></td>
              </tr>
            </table>
            
            <div style="margin-top: 30px;">
              <h2>Shipping Address</h2>
              <p>${orderData.customerInfo.name}<br>${orderData.customerInfo.shippingAddressString.replace(/\n/g, "<br>")}</p>
            </div>
            
            <div style="margin-top: 30px;">
              <h2>Billing Address</h2>
              <p>${orderData.customerInfo.name}<br>${orderData.customerInfo.billingAddressString.replace(/\n/g, "<br>")}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #777; font-size: 12px;">
              <p>© ${new Date().getFullYear()} SealClub Beauty. All rights reserved.</p>
              <p>This email was sent to ${orderData.customerInfo.email}</p>
            </div>
          </div>
        </body>
      </html>
    `

    console.log("🔍 [EMAIL-SERVICE] Email HTML generated successfully")

    // Determine the from address
    const fromEmail = `SealClub Beauty Orders <orders@${EMAIL_DOMAIN || "sealclubbeauty.com"}>`
    console.log(`🔍 [EMAIL-SERVICE] Using from address: ${fromEmail}`)

    // Send the email
    console.log(`🔍 [EMAIL-SERVICE] Sending email to: ${orderData.customerInfo.email}`)
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [orderData.customerInfo.email],
      subject: `Order Confirmation #${orderData.orderNumber}`,
      html,
    })

    if (error) {
      console.error("❌ [EMAIL-SERVICE] Error sending order confirmation email:", error)
      return { success: false, error }
    }

    console.log("✅ [EMAIL-SERVICE] Order confirmation email sent successfully", {
      emailId: data?.id,
      recipient: orderData.customerInfo.email,
      orderNumber: orderData.orderNumber,
    })
    return { success: true, data }
  } catch (error) {
    console.error("❌ [EMAIL-SERVICE] Exception in sendOrderConfirmationEmail:", error)
    return { success: false, error }
  }
}

// Other email functions remain unchanged
export async function sendShippingConfirmationEmail(
  orderData: OrderLogData,
  shippingData: ShippingUpdateData,
): Promise<EmailResult> {
  // Implementation remains the same
  try {
    // Generate tracking URL based on carrier
    const getTrackingUrl = (carrier: string, trackingCode: string) => {
      switch (carrier.toLowerCase()) {
        case "usps":
          return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingCode}`
        case "ups":
          return `https://www.ups.com/track?tracknum=${trackingCode}`
        case "fedex":
          return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingCode}`
        case "dhl":
          return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingCode}`
        default:
          return `#`
      }
    }

    const trackingUrl = getTrackingUrl(shippingData.carrier, shippingData.trackingCode)

    // Create a simple HTML email
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333;">OZPTides</h1>
            </div>
            <h1 style="color: #333;">Your Order Has Shipped!</h1>
            <p>Great news! Your order is on its way to you. You can track your package using the information below.</p>
            <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Tracking Information</h2>
              <p><strong>Carrier:</strong> ${shippingData.carrier}</p>
              <p><strong>Tracking Number:</strong> ${shippingData.trackingCode}</p>
              ${shippingData.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${shippingData.estimatedDelivery}</p>` : ""}
              <a href="${trackingUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Track Your Package</a>
            </div>
            
            <h2>Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${orderData.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                    <div>
                      <div style="font-weight: bold;">${item.name}</div>
                      <div>Quantity: ${item.quantity}</div>
                    </div>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </table>
            
            <div style="margin-top: 30px;">
              <h2>Shipping Address</h2>
              <p>${orderData.customerInfo.name}<br>${orderData.customerInfo.shippingAddressString.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions about your order, please contact our customer service team at <a href="mailto:support@sealclubbeauty.com" style="color: #0070f3;">support@sealclubbeauty.com</a></p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #777; font-size: 12px;">
              <p>© ${new Date().getFullYear()} OZPTides. All rights reserved.</p>
              <p>This email was sent to ${orderData.customerInfo.email}</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send the email
    const { data, error } = await resend.emails.send({
      from: `SealClub Beauty Shipping <shipping@${EMAIL_DOMAIN || "sealclubbeauty.com"}>`,
      to: [orderData.customerInfo.email],
      subject: `Your Order #${orderData.orderNumber} Has Shipped`,
      html,
    })

    if (error) {
      console.error("Error sending shipping confirmation email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending shipping confirmation email:", error)
    return { success: false, error }
  }
}

export async function sendAdminAuthEmail(email: string, code: string): Promise<EmailResult> {
  try {
    // Create a simple HTML email
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1a202c; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">SealClub Beauty Admin</h1>
            </div>
            <div style="padding: 20px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px;">Your authentication code is:</p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px 0; letter-spacing: 4px;">
                ${code}
              </div>
              <p style="font-size: 16px;">This code will expire in 10 minutes.</p>
              <p style="font-size: 16px;">If you did not request this code, please ignore this email or contact support immediately.</p>
            </div>
            <div style="padding: 20px; text-align: center;">
              <p style="font-size: 14px; color: #666;">© ${new Date().getFullYear()} SealClub Beauty. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send the email
    const { data, error } = await resend.emails.send({
      from: `SealClub Beauty Admin <admin@${EMAIL_DOMAIN || "sealclubbeauty.com"}>`,
      to: [email],
      subject: "SealClub Beauty Admin Authentication Code",
      html,
    })

    if (error) {
      console.error("Error sending admin auth email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending admin auth email:", error)
    return { success: false, error }
  }
}
