import { NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { 
  createSMSVerification, 
  getSMSVerification, 
  getRateLimit, 
  createOrUpdateRateLimit 
} from "@/lib/sms-db"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function isValidPhoneNumber(phone: string): boolean {
  // Basic phone validation - starts with + and has 10-15 digits
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

async function checkRateLimit(phone: string): Promise<boolean> {
  try {
    const rateLimit = await getRateLimit(phone)
    
    if (!rateLimit) {
      // No existing rate limit, create new one
      const resetTime = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      await createOrUpdateRateLimit(phone, resetTime)
      return true
    }
    
    if (rateLimit.request_count >= 3) {
      return false // Rate limited
    }
    
    // Update existing rate limit
    await createOrUpdateRateLimit(phone, rateLimit.reset_time)
    return true
  } catch (error) {
    console.error("Rate limit check error:", error)
    return true // Allow on error to avoid blocking users
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please include country code (e.g., +1234567890)" },
        { status: 400 }
      )
    }

    // Check rate limiting
    if (!(await checkRateLimit(phone))) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 1 hour." },
        { status: 429 }
      )
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

    // Store verification code in database
    await createSMSVerification({
      phone_number: phone,
      verification_code: code,
      attempts: 0,
      verified: false,
      expires_at: expiresAt
    })

    // Send SMS
    const message = await client.messages.create({
      body: `Your OZPTides verification code is: ${code}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })

    console.log(`SMS sent to ${phone}: ${message.sid}`)

    return NextResponse.json({ 
      success: true, 
      message: "Verification code sent successfully" 
    })

  } catch (error) {
    console.error("SMS send error:", error)
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }
}
