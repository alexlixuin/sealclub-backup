import { NextResponse } from "next/server"
import { createAffiliate, createAffiliateCode } from "@/lib/affiliate-service"

export async function POST(request: Request) {
  try {
    const { name, email, commissionRate, code, discountPercentage } = await request.json()

    // Validate required fields
    if (!name || !email || !code) {
      return NextResponse.json({ error: "Name, email, and code are required" }, { status: 400 })
    }

    // Create affiliate
    const {
      success: affiliateSuccess,
      affiliate,
      error: affiliateError,
    } = await createAffiliate(name, email, commissionRate)

    if (!affiliateSuccess || !affiliate) {
      return NextResponse.json({ error: affiliateError || "Failed to create affiliate" }, { status: 500 })
    }

    // Create affiliate code
    const {
      success: codeSuccess,
      affiliateCode,
      error: codeError,
    } = await createAffiliateCode(affiliate.id, code, discountPercentage)

    if (!codeSuccess) {
      return NextResponse.json({ error: codeError || "Failed to create affiliate code" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      affiliate,
      affiliateCode,
    })
  } catch (error) {
    console.error("Error creating affiliate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
