import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Img,
  Button,
  Link,
} from '@react-email/components'

export const OrderUpdateEmail = () => (
  <Html>
    <Head />
    <Preview>🚨 URGENT: Order Update Required - Action Needed</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src="https://sealclubbeauty.com/images/logo-ozptides-transparent.png"
            alt="SealClub Beauty"
            width="200"
            height="60"
            style={logo}
          />
          <Section style={urgentBanner}>
            <Text style={urgentText}>🚨 URGENT ORDER UPDATE</Text>
          </Section>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          {/* Highlighted Ignore Section */}
          <Section style={ignoreSection}>
            <Text style={ignoreText}>
              IGNORE THIS EMAIL IF YOU RECEIVED YOUR ORDER OR IT'S IN DISPATCH
            </Text>
          </Section>

          {/* Main Message */}
          <Text style={messageText}>
            We have recently identified that some orders may have experienced delays in our fulfillment process. 
            If you have placed an order with us and have not yet received your product, we sincerely apologize 
            for any inconvenience and would like to resolve this matter immediately.
          </Text>

          <Text style={messageText}>
            Please contact our customer support team as soon as possible so we can expedite your order 
            and provide appropriate compensation, including store credit, for the delay.
          </Text>

          {/* Call to Action Button */}
          <Section style={buttonSection}>
            <Button style={chatButton} href="https://sealclubbeauty.com">
              Contact Live Chat Support
            </Button>
          </Section>

          {/* Instructions */}
          <Section style={instructionSection}>
            <Text style={instructionText}>
              <strong>Important:</strong> When you connect to live chat, please have your order number ready. 
              This will help us locate your order quickly and provide immediate assistance.
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Text style={contactHeader}>Alternative contact methods:</Text>
            <Text style={contactItem}><strong>Email:</strong> support@sealclubbeauty.com</Text>
            <Text style={contactItem}><strong>Website:</strong> sealclubbeauty.com</Text>
          </Section>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>© 2024 SealClub Beauty. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles
const main = {
  backgroundColor: '#1a1a1a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const brandName = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 16px 0',
}

const urgentBanner = {
  backgroundColor: '#dc2626',
  padding: '12px',
  borderRadius: '8px',
  border: '2px solid #ef4444',
}

const urgentText = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '0 20px',
}

const ignoreSection = {
  backgroundColor: '#fef3c7',
  border: '3px solid #f59e0b',
  borderLeft: '6px solid #f59e0b',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const ignoreText = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const messageText = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '24px',
}

const contactSection = {
  backgroundColor: '#374151',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const contactHeader = {
  color: '#d1d5db',
  fontSize: '14px',
  margin: '0 0 8px 0',
}

const contactItem = {
  color: '#f3f4f6',
  fontSize: '14px',
  margin: '4px 0',
}

const divider = {
  borderColor: '#4b5563',
  margin: '24px 0',
}

const footer = {
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}

const logo = {
  margin: '0 auto 16px auto',
  display: 'block' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const chatButton = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
}

const instructionSection = {
  backgroundColor: '#1f2937',
  border: '2px solid #374151',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const instructionText = {
  color: '#f3f4f6',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
}

export default OrderUpdateEmail
