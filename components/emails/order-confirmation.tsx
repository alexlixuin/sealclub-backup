import React from "react"
import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import type { OrderLogData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface OrderConfirmationEmailProps {
  order: OrderLogData
}

export const OrderConfirmationEmailTemplate = ({ order }: OrderConfirmationEmailProps) => {
  const previewText = `Your SealClub Beauty order #${order.orderNumber} has been confirmed`

  // Safe render function for potentially problematic values
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) {
      return ""
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value)
      } catch (e) {
        return "[Object]"
      }
    }
    return String(value)
  }

  // Get the shipping and billing address lines
  let shippingAddressString = order.customerInfo?.shippingAddressString || "No address provided"
  let billingAddressString = order.customerInfo?.billingAddressString || "No address provided"

  // If they're objects, convert them to strings
  if (typeof shippingAddressString === "object") {
    try {
      shippingAddressString = JSON.stringify(shippingAddressString)
    } catch (e) {
      shippingAddressString = "Invalid address format"
    }
  }

  if (typeof billingAddressString === "object") {
    try {
      billingAddressString = JSON.stringify(billingAddressString)
    } catch (e) {
      billingAddressString = "Invalid address format"
    }
  }

  const shippingAddressLines = shippingAddressString.split("\n")
  const billingAddressLines = billingAddressString.split("\n")

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/logo-ozptides-transparent.png`}
              width="150"
              height="50"
              alt="SealClub Beauty"
              style={logo}
            />
          </Section>
          <Section style={section}>
            <Text style={heading}>Order Confirmation</Text>
            <Text style={paragraph}>
              Thank you for your order! We've received your order and are processing it now.
            </Text>
            <Text style={paragraph}>
              <strong>Order Number:</strong> #{safeRender(order.orderNumber)}
            </Text>
            <Text style={paragraph}>
              <strong>Order Date:</strong> {new Date().toLocaleDateString()}
            </Text>

            <Hr style={hr} />

            <Text style={subheading}>Order Summary</Text>

            {order.items &&
              order.items.map((item: any) => (
                <Row key={item.id} style={itemRow}>
                  <Column style={imageColumn}>
                    <Img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${safeRender(item.image)}`}
                      width="80"
                      height="80"
                      alt={safeRender(item.name)}
                      style={productImage}
                    />
                  </Column>
                  <Column style={detailsColumn}>
                    <Text style={itemName}>{safeRender(item.name)}</Text>
                    <Text style={itemDetails}>Quantity: {safeRender(item.quantity)}</Text>
                    <Text style={itemPrice}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</Text>
                  </Column>
                </Row>
              ))}

            <Hr style={hr} />

            <Row style={summaryRow}>
              <Column style={summaryLabelColumn}>
                <Text style={summaryLabel}>Subtotal:</Text>
              </Column>
              <Column style={summaryValueColumn}>
                <Text style={summaryValue}>{formatCurrency(order.subtotal || 0)}</Text>
              </Column>
            </Row>

            <Row style={summaryRow}>
              <Column style={summaryLabelColumn}>
                <Text style={summaryLabel}>Shipping:</Text>
              </Column>
              <Column style={summaryValueColumn}>
                <Text style={summaryValue}>{formatCurrency(order.shipping || 0)}</Text>
              </Column>
            </Row>

            <Row style={totalRow}>
              <Column style={summaryLabelColumn}>
                <Text style={totalLabel}>Total:</Text>
              </Column>
              <Column style={summaryValueColumn}>
                <Text style={totalValue}>{formatCurrency(order.total || 0)}</Text>
              </Column>
            </Row>

            <Hr style={hr} />

            <Section style={addressSection}>
              <Row>
                <Column style={addressColumn}>
                  <Text style={subheading}>Shipping Address</Text>
                  <Text style={addressText}>
                    {safeRender(order.customerInfo?.name)}
                    <br />
                    {shippingAddressLines.map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < shippingAddressLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </Text>
                </Column>
                <Column style={addressColumn}>
                  <Text style={subheading}>Billing Address</Text>
                  <Text style={addressText}>
                    {safeRender(order.customerInfo?.name)}
                    <br />
                    {billingAddressLines.map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < billingAddressLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              If you have any questions about your order, please contact our customer service team at{" "}
              <Link href="mailto:support@sealclubbeauty.com" style={link}>
                support@sealclubbeauty.com
              </Link>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} SealClub Beauty. All rights reserved.</Text>
            <Text style={footerText}>This email was sent to {safeRender(order.customerInfo?.email)}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
}

const section = {
  padding: "0 24px",
}

const logoContainer = {
  padding: "20px 30px",
  backgroundColor: "#f0f4f8",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "30px",
  marginBottom: "10px",
  color: "#333",
}

const subheading = {
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "20px",
  marginBottom: "10px",
  color: "#333",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#444",
  marginBottom: "16px",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const itemRow = {
  marginBottom: "20px",
}

const imageColumn = {
  width: "80px",
  verticalAlign: "top",
}

const detailsColumn = {
  paddingLeft: "16px",
  verticalAlign: "top",
}

const productImage = {
  borderRadius: "4px",
  border: "1px solid #e6ebf1",
}

const itemName = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "4px",
}

const itemDetails = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "4px",
}

const itemPrice = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333",
}

const summaryRow = {
  marginBottom: "8px",
}

const summaryLabelColumn = {
  width: "60%",
  textAlign: "right" as const,
  paddingRight: "16px",
}

const summaryValueColumn = {
  width: "40%",
}

const summaryLabel = {
  fontSize: "14px",
  color: "#666",
}

const summaryValue = {
  fontSize: "14px",
  color: "#333",
}

const totalRow = {
  marginTop: "8px",
  marginBottom: "8px",
}

const totalLabel = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
}

const totalValue = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
}

const addressSection = {
  marginTop: "30px",
  marginBottom: "30px",
}

const addressColumn = {
  width: "50%",
  verticalAlign: "top",
}

const addressText = {
  fontSize: "14px",
  color: "#666",
  lineHeight: "1.5",
}

const link = {
  color: "#0070f3",
  textDecoration: "underline",
}

const footer = {
  marginTop: "32px",
  padding: "20px 30px",
  backgroundColor: "#f0f4f8",
  textAlign: "center" as const,
}

const footerText = {
  fontSize: "12px",
  color: "#666",
  lineHeight: "1.5",
  margin: "4px 0",
}
