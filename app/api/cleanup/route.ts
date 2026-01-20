import { NextRequest, NextResponse } from "next/server"
import { cleanupExpiredRecords } from "@/lib/sms-db"

// API endpoint to manually trigger cleanup of expired SMS records
export async function POST(request: NextRequest) {
  try {
    const deletedCount = await cleanupExpiredRecords()
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired records`,
      deletedCount
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json(
      { error: "Failed to cleanup expired records" },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "SMS cleanup endpoint is available"
  })
}
