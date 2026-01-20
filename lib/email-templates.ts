import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_WEBSITE, COMPANY_LOGO, COMPANY_COLORS } from "./email-config"
import type { OrderLogData } from "./types"
import { addressToString } from "./address-utils"

export function getOrderConfirmationEmailHtml(order: OrderLogData) {
  const items = order.items
    .map(
      (item: { name: string; size?: string; quantity: number; price: number }) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${item.name} ${item.size ? `(${item.size})` : ""}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("")

  // Format shipping address as HTML
  const shippingAddressHtml = formatAddressForEmail(
    order.customerInfo.shippingAddressString ||
      (order.customerInfo.shippingAddress
        ? addressToString(order.customerInfo.shippingAddress)
        : "No address provided"),
  )

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Order Confirmation</title>
        <style>
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important;
            }
            
            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span,
            table.body a {
              font-size: 16px !important;
            }
            
            table.body .wrapper,
            table.body .article {
              padding: 10px !important;
            }
            
            table.body .content {
              padding: 0 !important;
            }
            
            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }
            
            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
            
            table.body .btn table {
              width: 100% !important;
            }
            
            table.body .btn a {
              width: 100% !important;
            }
            
            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
          }
        </style>
      </head>
      <body style="background-color: #f6f9fc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f9fc; width: 100%;" width="100%" bgcolor="#f6f9fc">
          <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
              <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr>
                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <div style="text-align: center; margin-bottom: 20px;">
                              <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-width: 200px; height: auto;">
                            </div>
                            <h1 style="color: ${COMPANY_COLORS.primary}; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center;">Order Confirmation</h1>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hi ${
                              order.customerInfo.name || "there"
                            },</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for your order! We've received your purchase and are processing it now.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><strong>Order Number:</strong> ${
                              order.orderNumber
                            }</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><strong>Order Date:</strong> ${new Date(
                              order.createdAt || Date.now(),
                            ).toLocaleDateString()}</p>
                            
                            <h2 style="color: ${
                              COMPANY_COLORS.secondary
                            }; font-family: sans-serif; font-weight: 400; line-height: 1.4; margin: 0; margin-bottom: 15px; font-size: 18px;">Order Summary</h2>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; margin-bottom: 20px;" width="100%">
                              <thead>
                                <tr>
                                  <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: left;">Product</th>
                                  <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: center;">Qty</th>
                                  <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Price</th>
                                  <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${items}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                                  <td style="padding: 10px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                                  <td style="padding: 10px; text-align: right;">$${order.shipping.toFixed(2)}</td>
                                </tr>

                                <tr>
                                  <td colspan="3" style="padding: 10px; border-top: 2px solid #e5e7eb; text-align: right;"><strong>Total:</strong></td>
                                  <td style="padding: 10px; border-top: 2px solid #e5e7eb; text-align: right;"><strong>$${order.total.toFixed(
                                    2,
                                  )}</strong></td>
                                </tr>
                              </tfoot>
                            </table>
                            
                            <h2 style="color: ${
                              COMPANY_COLORS.secondary
                            }; font-family: sans-serif; font-weight: 400; line-height: 1.4; margin: 0; margin-bottom: 15px; font-size: 18px;">Shipping Information</h2>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                              ${shippingAddressHtml}
                            </p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><strong>Shipping Method:</strong> ${
                              order.shippingMethod || "Standard Shipping"
                            }</p>
                            
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We'll send you another email when your order ships. If you have any questions, please contact our customer service team.</p>
                            
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for shopping with us!</p>
                            
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Best regards,<br>The ${COMPANY_NAME} Team</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- END CENTERED WHITE CONTAINER -->
                
                <!-- START FOOTER -->
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">${COMPANY_NAME}, ${COMPANY_ADDRESS}</span>
                        <br>
                        <a href="${COMPANY_WEBSITE}" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">${COMPANY_WEBSITE}</a>
                      </td>
                    </tr>
                    <tr>
                      <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        This email was sent to ${
                          order.customerInfo.email
                        }. Please note that all products are for research purposes only.
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- END FOOTER -->
              </div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export function getShippingConfirmationEmailHtml(order: OrderLogData, trackingInfo: { code: string; carrier: string }) {
  // Format shipping address as HTML
  const shippingAddressHtml = formatAddressForEmail(
    order.customerInfo.shippingAddressString ||
      (order.customerInfo.shippingAddress
        ? addressToString(order.customerInfo.shippingAddress)
        : "No address provided"),
  )

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Your Order Has Shipped</title>
        <style>
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important;
            }
            
            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span,
            table.body a {
              font-size: 16px !important;
            }
            
            table.body .wrapper,
            table.body .article {
              padding: 10px !important;
            }
            
            table.body .content {
              padding: 0 !important;
            }
            
            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }
            
            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
            
            table.body .btn table {
              width: 100% !important;
            }
            
            table.body .btn a {
              width: 100% !important;
            }
            
            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
          }
        </style>
      </head>
      <body style="background-color: #f6f9fc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f9fc; width: 100%;" width="100%" bgcolor="#f6f9fc">
          <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
              <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr>
                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <div style="text-align: center; margin-bottom: 20px;">
                              <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-width: 200px; height: auto;">
                            </div>
                            <h1 style="color: ${COMPANY_COLORS.primary}; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center;">Your Order Has Shipped!</h1>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hi ${
                              order.customerInfo.name || "there"
                            },</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Great news! Your order has been shipped and is on its way to you.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><strong>Order Number:</strong> ${
                              order.orderNumber
                            }</p>
                            
                            <div style="background-color: ${
                              COMPANY_COLORS.accent
                            }; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
                              <h2 style="color: ${
                                COMPANY_COLORS.secondary
                              }; font-family: sans-serif; font-weight: 400; line-height: 1.4; margin: 0; margin-bottom: 15px; font-size: 18px;">Tracking Information</h2>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 5px;"><strong>Carrier:</strong> ${
                                trackingInfo.carrier
                              }</p>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"><strong>Tracking Number:</strong> ${
                                trackingInfo.code
                              }</p>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                        <tbody>
                                          <tr>
                                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: ${
                                              COMPANY_COLORS.primary
                                            };" valign="top" align="center" bgcolor="${COMPANY_COLORS.primary}">
                                              <a href="${getTrackingUrl(
                                                trackingInfo.carrier,
                                                trackingInfo.code,
                                              )}" target="_blank" style="border: solid 1px ${
                                                COMPANY_COLORS.primary
                                              }; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: ${
                                                COMPANY_COLORS.primary
                                              }; border-color: ${COMPANY_COLORS.primary}; color: #ffffff;">Track Your Package</a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            
                            <h2 style="color: ${
                              COMPANY_COLORS.secondary
                            }; font-family: sans-serif; font-weight: 400; line-height: 1.4; margin: 0; margin-bottom: 15px; font-size: 18px;">Shipping Address</h2>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                              ${shippingAddressHtml}
                            </p>
                            
                            <h2 style="color: ${
                              COMPANY_COLORS.secondary
                            }; font-family: sans-serif; font-weight: 400; line-height: 1.4; margin: 0; margin-bottom: 15px; font-size: 18px;">Order Summary</h2>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                              ${order.items
                                .map(
                                  (item: { name: string; size?: string; quantity: number; price: number }) =>
                                    `${item.quantity}x ${item.name} ${item.size ? `(${item.size})` : ""} - $${(
                                      item.price * item.quantity
                                    ).toFixed(2)}`,
                                )
                                .join("<br>")}
                            </p>
                            
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you have any questions about your order, please contact our customer service team.</p>
                            
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for shopping with us!</p>
                            
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Best regards,<br>The ${COMPANY_NAME} Team</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- END CENTERED WHITE CONTAINER -->
                
                <!-- START FOOTER -->
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">${COMPANY_NAME}, ${COMPANY_ADDRESS}</span>
                        <br>
                        <a href="${COMPANY_WEBSITE}" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">${COMPANY_WEBSITE}</a>
                      </td>
                    </tr>
                    <tr>
                      <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        This email was sent to ${
                          order.customerInfo.email
                        }. Please note that all products are for research purposes only.
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- END FOOTER -->
              </div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>
  `
}

// Helper function to get tracking URL based on carrier
function getTrackingUrl(carrier: string, trackingCode: string): string {
  const normalizedCarrier = carrier.toLowerCase().trim()

  if (normalizedCarrier.includes("usps")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingCode}`
  } else if (normalizedCarrier.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${trackingCode}`
  } else if (normalizedCarrier.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingCode}`
  } else if (normalizedCarrier.includes("dhl")) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingCode}`
  } else {
    // Generic tracking link that will likely redirect to the appropriate carrier
    return `https://parcelsapp.com/en/tracking/${trackingCode}`
  }
}

// Helper function to format address for email
function formatAddressForEmail(address: string): string {
  if (!address) return "No address provided"

  // Split by newlines and join with <br> for HTML
  return address.split("\n").join("<br>")
}
