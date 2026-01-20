import { NextRequest, NextResponse } from "next/server"
import { 
  getSMSVerification, 
  updateSMSVerification, 
  deleteSMSVerification,
  createDiscountCode 
} from "@/lib/sms-db"

function generateDiscountCode(): string {
  const prefix = "SMS10"
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${suffix}`
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 }
      )
    }

    // Get stored verification data
    const storedData = await getSMSVerification(phone)
    
    if (!storedData) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new code." },
        { status: 400 }
      )
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      await deleteSMSVerification(storedData.id!)
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 400 }
      )
    }

    // Verify code
    if (storedData.verification_code !== code) {
      await updateSMSVerification(storedData.id!, { 
        attempts: storedData.attempts + 1 
      })
      return NextResponse.json(
        { error: `Invalid verification code. ${3 - (storedData.attempts + 1)} attempts remaining.` },
        { status: 400 }
      )
    }

    // Code is valid - generate discount code
    const discountCode = generateDiscountCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    
    // Store discount code in database
    await createDiscountCode({
      code: discountCode,
      phone_number: phone,
      discount_percentage: 10,
      used: false,
      expires_at: expiresAt
    })

    // Mark verification as completed and clean up
    await updateSMSVerification(storedData.id!, { verified: true })
    await deleteSMSVerification(storedData.id!)

    console.log(`Discount code generated for ${phone}: ${discountCode}`)

    return NextResponse.json({
      success: true,
      discountCode,
      discount: 10,
      expiresIn: 10 * 60 * 1000, // 10 minutes in milliseconds
      message: "Verification successful! Your 10% discount code is ready."
    })

  } catch (error) {
    console.error("SMS verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify code. Please try again." },
      { status: 500 }
    )
  }
}
