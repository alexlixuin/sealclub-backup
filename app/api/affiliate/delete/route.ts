import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("id")

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    // Check if affiliate has any transactions
    const { data: transactions, error: transactionError } = await supabaseAdmin
      .from("affiliate_transactions")
      .select("id")
      .eq("affiliate_id", affiliateId)
      .limit(1)

    if (transactionError) {
      console.error("Error checking affiliate transactions:", transactionError)
      return NextResponse.json({ error: "Failed to check affiliate transactions" }, { status: 500 })
    }

    // If affiliate has transactions, we should not delete but deactivate instead
    if (transactions && transactions.length > 0) {
      const { error: deactivateError } = await supabaseAdmin
        .from("affiliates")
        .update({ status: "inactive" })
        .eq("id", affiliateId)

      if (deactivateError) {
        console.error("Error deactivating affiliate:", deactivateError)
        return NextResponse.json({ error: "Failed to deactivate affiliate" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Affiliate deactivated due to existing transactions",
        action: "deactivated",
      })
    }

    // If no transactions, we can safely delete
    // First delete affiliate codes
    const { error: codesError } = await supabaseAdmin.from("affiliate_codes").delete().eq("affiliate_id", affiliateId)

    if (codesError) {
      console.error("Error deleting affiliate codes:", codesError)
      return NextResponse.json({ error: "Failed to delete affiliate codes" }, { status: 500 })
    }

    // Then delete the affiliate
    const { error: affiliateError } = await supabaseAdmin.from("affiliates").delete().eq("id", affiliateId)

    if (affiliateError) {
      console.error("Error deleting affiliate:", affiliateError)
      return NextResponse.json({ error: "Failed to delete affiliate" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Affiliate deleted successfully",
      action: "deleted",
    })
  } catch (error) {
    console.error("Error in affiliate deletion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
