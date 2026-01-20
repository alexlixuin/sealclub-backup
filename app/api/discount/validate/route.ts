import { NextRequest, NextResponse } from "next/server"
import { getDiscountCode, markDiscountCodeAsUsed } from "@/lib/sms-db"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      )
    }

    // Get discount code data
    const discountData = await getDiscountCode(code)
    
    if (!discountData) {
      return NextResponse.json(
        { error: "Invalid discount code" },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > new Date(discountData.expires_at)) {
      return NextResponse.json(
        { error: "Discount code has expired" },
        { status: 400 }
      )
    }

    // Check if already used
    if (discountData.used) {
      return NextResponse.json(
        { error: "Discount code has already been used" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      discount: discountData.discount_percentage,
      code: discountData.code,
      expiresAt: discountData.expires_at
    })

  } catch (error) {
    console.error("Discount validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate discount code" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      )
    }

    // Get discount code data
    const discountData = await getDiscountCode(code)
    
    if (!discountData) {
      return NextResponse.json(
        { error: "Invalid discount code" },
        { status: 400 }
      )
    }

    // Mark as used
    await markDiscountCodeAsUsed(code)

    return NextResponse.json({
      success: true,
      message: "Discount code marked as used"
    })

  } catch (error) {
    console.error("Discount usage error:", error)
    return NextResponse.json(
      { error: "Failed to mark discount as used" },
      { status: 500 }
    )
  }
}
