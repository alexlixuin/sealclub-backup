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
  Button,
} from "@react-email/components"
import type { OrderLogData, ShippingUpdateData } from "@/lib/types"

interface ShippingConfirmationEmailProps {
  order: OrderLogData
  shipping: ShippingUpdateData
}

export const ShippingConfirmationEmailTemplate = ({ order, shipping }: ShippingConfirmationEmailProps) => {
  const previewText = `Your SealClub Beauty order #${order.orderNumber} has shipped!`

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

  const trackingUrl = getTrackingUrl(shipping.carrier, shipping.trackingCode)

  // Get the shipping address lines
  let addressString = order.customerInfo?.shippingAddressString || "No address provided"

  // If it's an object, convert it to a string
  if (typeof addressString === "object") {
    try {
      addressString = JSON.stringify(addressString)
    } catch (e) {
      addressString = "Invalid address format"
    }
  }

  const addressLines = addressString.split("\n")

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
            <Text style={heading}>Your Order Has Shipped!</Text>
            <Text style={paragraph}>
              Great news! Your order is on its way to you. You can track your package using the information below.
            </Text>
            <Text style={paragraph}>
              <strong>Order Number:</strong> #{safeRender(order.orderNumber)}
            </Text>

            <Section style={trackingSection}>
              <Text style={subheading}>Tracking Information</Text>
              <Text style={paragraph}>
                <strong>Carrier:</strong> {safeRender(shipping.carrier)}
              </Text>
              <Text style={paragraph}>
                <strong>Tracking Number:</strong> {safeRender(shipping.trackingCode)}
              </Text>
              {shipping.estimatedDelivery && (
                <Text style={paragraph}>
                  <strong>Estimated Delivery:</strong> {safeRender(shipping.estimatedDelivery)}
                </Text>
              )}
              <Button href={trackingUrl} style={trackButton}>
                Track Your Package
              </Button>
            </Section>

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
                  </Column>
                </Row>
              ))}

            <Hr style={hr} />

            <Section style={addressSection}>
              <Text style={subheading}>Shipping Address</Text>
              <Text style={addressText}>
                {safeRender(order.customerInfo?.name)}
                <br />
                {addressLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </Text>
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

const trackingSection = {
  backgroundColor: "#f0f4f8",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "20px",
  marginBottom: "20px",
}

const trackButton = {
  backgroundColor: "#0070f3",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 16px",
  marginTop: "16px",
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

const addressSection = {
  marginTop: "20px",
  marginBottom: "20px",
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
