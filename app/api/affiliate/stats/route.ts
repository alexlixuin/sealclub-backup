import { NextResponse } from "next/server"
import { getAllAffiliatesWithStats } from "@/lib/affiliate-service"

export async function GET() {
  try {
    const affiliates = await getAllAffiliatesWithStats()

    return NextResponse.json({
      success: true,
      affiliates,
    })
  } catch (error) {
    console.error("Error fetching affiliate stats:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate statistics" }, { status: 500 })
  }
}
