import { NextResponse } from "next/server"
import { getAffiliateTransactions } from "@/lib/affiliate-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const transactions = await getAffiliateTransactions(affiliateId, limit, offset)

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching affiliate transactions:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate transactions" }, { status: 500 })
  }
}
