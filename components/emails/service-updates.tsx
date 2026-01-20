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

export const ServiceUpdatesEmail = () => (
  <Html>
    <Head />
    <Preview>Important Service Update: Payment & Shipping Changes</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src="https://sealclubbeauty.com/images/logo-ozptides-transparent.png"
            alt="SealClub Beauty"
            width="180"
            height="54"
            style={logo}
          />
          <Section style={announcementBanner}>
            <Text style={announcementText}>⚠️ IMPORTANT SERVICE UPDATE</Text>
          </Section>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          {/* Service Notice Header */}
          <Section style={goodNewsSection}>
            <Text style={goodNewsText}>
              CRITICAL PAYMENT & SHIPPING SYSTEM CHANGES
            </Text>
          </Section>

          {/* Updates Grid */}
          <Section style={updatesGrid}>
            {/* Card Payments Update */}
            <Section style={updateCard}>
              <Section style={updateIconSection}>
                <Text style={updateIcon}>💳</Text>
              </Section>
              <Text style={updateTitle}>Payment System Restored</Text>
              <Text style={updateDescription}>
                Following recent technical maintenance, card payment processing has been restored. 
                All Visa, Mastercard, and American Express transactions are now operational.
              </Text>
              <Section style={featureList}>
                <Text style={featureItem}>✓ Secure payment processing</Text>
                <Text style={featureItem}>✓ Instant order confirmation</Text>
                <Text style={featureItem}>✓ All major cards accepted</Text>
              </Section>
            </Section>

            {/* USA Shipping Update */}
            <Section style={updateCard}>
              <Section style={updateIconSection}>
                <Text style={updateIcon}>🇺🇸</Text>
              </Section>
              <Text style={updateTitle}>USA Shipping Service Restored</Text>
              <Text style={updateDescription}>
                Due to resolved logistics issues, shipping services to the United States have resumed. 
                All US delivery routes are now operational for order fulfillment.
              </Text>
              <Section style={featureList}>
                <Text style={featureItem}>✓ Fast international delivery</Text>
                <Text style={featureItem}>✓ Secure packaging & handling</Text>
                <Text style={featureItem}>✓ Full tracking provided</Text>
              </Section>
            </Section>
          </Section>

          {/* Service Restoration Credit */}
          <Section style={discountSection}>
            <Text style={discountTitle}>⚠️ Service Restoration Credit</Text>
            <Text style={discountDescription}>
              Due to recent service interruptions, we're providing <strong>10% credit</strong> for affected customers.
            </Text>
            <Section style={discountCodeBox}>
              <Text style={discountCodeLabel}>Discount Code:</Text>
              <Text style={discountCode}>USACARD10</Text>
            </Section>
            <Text style={discountExpiry}>
              ⚠️ Credit expires in 7 days - use before system reset
            </Text>
          </Section>

          {/* System Access */}
          <Text style={ctaText}>
            Access the updated payment system to complete any pending transactions.
          </Text>

          <Section style={buttonSection}>
            <Button style={shopButton} href="https://sealclubbeauty.com">
              Access Updated System
            </Button>
          </Section>

          {/* System Information */}
          <Section style={infoSection}>
            <Text style={infoText}>
              <strong>System Changes:</strong> Updated security protocols, improved processing infrastructure, and restored shipping capabilities. 
              All services are now fully operational.
            </Text>
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Text style={contactHeader}>Questions? We're here to help:</Text>
            <Text style={contactItem}><strong>Live Chat:</strong> Available 24/7 on sealclubbeauty.com</Text>
            <Text style={contactItem}><strong>Email:</strong> support@sealclubbeauty.com</Text>
            <Text style={contactItem}><strong>Website:</strong> sealclubbeauty.com</Text>
          </Section>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>© 2024 SealClub Beauty. All rights reserved.</Text>
          <Text style={footerSubtext}>Clinical-luxury skincare and wellness worldwide</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles with liquid glass theme and gridded background
const main = {
  backgroundColor: '#0a0a0a',
  backgroundImage: `
    radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)
  `,
  backgroundSize: '20px 20px, 100% 100%',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  minHeight: '100vh',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
  padding: '20px',
  backgroundColor: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.3)',
}

const logo = {
  margin: '0 auto 20px auto',
  display: 'block' as const,
  borderRadius: '8px',
  objectFit: 'contain' as const,
}

const announcementBanner = {
  backgroundColor: 'rgba(34, 197, 94, 0.2)',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid rgba(34, 197, 94, 0.4)',
  backdropFilter: 'blur(10px)',
}

const announcementText = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
  textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
}

const content = {
  padding: '0 20px',
}

const goodNewsSection = {
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  padding: '20px',
  borderRadius: '16px',
  marginBottom: '32px',
  backdropFilter: 'blur(10px)',
}

const goodNewsText = {
  color: '#60a5fa',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
  textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
}

const updatesGrid = {
  marginBottom: '32px',
}

const updateCard = {
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  border: '1px solid rgba(71, 85, 105, 0.5)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px',
  backdropFilter: 'blur(15px)',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
}

const updateIconSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const updateIcon = {
  fontSize: '48px',
  margin: '0',
  filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
}

const updateTitle = {
  color: '#f1f5f9',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
}

const updateDescription = {
  color: '#cbd5e1',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '16px',
  textAlign: 'center' as const,
}

const featureList = {
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid rgba(59, 130, 246, 0.2)',
}

const featureItem = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '4px 0',
  textAlign: 'center' as const,
}

const ctaText = {
  color: '#e2e8f0',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  marginBottom: '24px',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const shopButton = {
  backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: '1px solid rgba(59, 130, 246, 0.5)',
  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
}

const infoSection = {
  backgroundColor: 'rgba(67, 56, 202, 0.1)',
  border: '1px solid rgba(67, 56, 202, 0.3)',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  backdropFilter: 'blur(10px)',
}

const infoText = {
  color: '#a5b4fc',
  fontSize: '15px',
  margin: '0',
  textAlign: 'center' as const,
  lineHeight: '1.5',
}

const contactSection = {
  backgroundColor: 'rgba(30, 41, 59, 0.6)',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: '1px solid rgba(71, 85, 105, 0.5)',
  backdropFilter: 'blur(10px)',
}

const contactHeader = {
  color: '#f1f5f9',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
}

const contactItem = {
  color: '#cbd5e1',
  fontSize: '14px',
  margin: '6px 0',
  textAlign: 'center' as const,
}

const divider = {
  borderColor: 'rgba(71, 85, 105, 0.5)',
  margin: '32px 0',
}

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
}

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0 0 4px 0',
}

const footerSubtext = {
  color: '#64748b',
  fontSize: '11px',
  margin: '0',
  fontStyle: 'italic',
}

const discountSection = {
  backgroundColor: 'rgba(168, 85, 247, 0.15)',
  border: '2px solid rgba(168, 85, 247, 0.4)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '32px',
  backdropFilter: 'blur(15px)',
  textAlign: 'center' as const,
  boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
}

const discountTitle = {
  color: '#c084fc',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  textShadow: '0 0 15px rgba(192, 132, 252, 0.6)',
}

const discountDescription = {
  color: '#e2e8f0',
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '20px',
  textAlign: 'center' as const,
}

const discountCodeBox = {
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  border: '2px solid rgba(168, 85, 247, 0.6)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
  backdropFilter: 'blur(10px)',
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
}

const discountCodeLabel = {
  color: '#cbd5e1',
  fontSize: '14px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
}

const discountCode = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  fontFamily: 'Monaco, "Lucida Console", monospace',
  margin: '0',
  textAlign: 'center' as const,
  letterSpacing: '2px',
  textShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
  backgroundColor: 'rgba(168, 85, 247, 0.2)',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(168, 85, 247, 0.5)',
}

const discountExpiry = {
  color: '#fbbf24',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
}

export default ServiceUpdatesEmail
