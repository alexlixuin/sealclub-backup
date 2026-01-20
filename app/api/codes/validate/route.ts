import { NextResponse } from "next/server"
import { validateCode, applyDiscount, applyAffiliateCode, applySMSDiscount } from "@/lib/enhanced-discount-service"

export async function POST(request: Request) {
  try {
    const { code, subtotal, customerEmail } = await request.json()

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "Invalid request. Code and subtotal are required." }, { status: 400 })
    }

    // Validate the code (could be discount or affiliate)
    const validationResult = await validateCode(code, subtotal, customerEmail)

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          isValid: false,
          error: validationResult.error || "Invalid code",
        },
        { status: 200 },
      )
    }

    if (validationResult.type === "discount" && validationResult.discount) {
      // Handle regular discount code
      const discountResult = applyDiscount(validationResult.discount, subtotal)

      return NextResponse.json({
        isValid: true,
        type: "discount",
        discount: validationResult.discount,
        discountAmount: discountResult.discountAmount,
        total: discountResult.total,
      })
    } else if (validationResult.type === "affiliate" && validationResult.affiliateCode) {
      // Handle affiliate code
      const affiliateResult = applyAffiliateCode(validationResult.affiliateCode, subtotal)

      return NextResponse.json({
        isValid: true,
        type: "affiliate",
        affiliateCode: validationResult.affiliateCode,
        discountAmount: affiliateResult.discountAmount,
        total: affiliateResult.total,
        affiliateInfo: affiliateResult.affiliateInfo,
      })
    } else if (validationResult.type === "sms" && validationResult.smsCode) {
      // Handle SMS discount code
      const smsResult = applySMSDiscount(validationResult.smsCode, subtotal)

      return NextResponse.json({
        isValid: true,
        type: "sms",
        smsCode: validationResult.smsCode,
        discountAmount: smsResult.discountAmount,
        total: smsResult.total,
      })
    }

    return NextResponse.json({ error: "Unknown code type" }, { status: 500 })
  } catch (error) {
    console.error("Error validating code:", error)
    return NextResponse.json({ error: "An error occurred while validating the code" }, { status: 500 })
  }
}
