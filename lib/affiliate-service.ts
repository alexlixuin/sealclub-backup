import { getSupabaseAdmin } from "./supabase"

export type Affiliate = {
  id: string
  name: string
  email: string
  commission_rate: number
  status: "active" | "inactive" | "suspended"
  total_earnings: number
  total_referrals: number
  created_at: string
  updated_at: string
}

export type AffiliateCode = {
  id: string
  affiliate_id: string
  code: string
  discount_percentage: number
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export type AffiliateTransaction = {
  id: string
  affiliate_id: string
  affiliate_code_id: string
  order_number: string
  customer_email: string
  order_total: number
  commission_rate: number
  commission_amount: number
  status: "pending" | "confirmed" | "paid" | "cancelled"
  created_at: string
  updated_at: string
}

export type AffiliateStats = {
  totalEarnings: number
  totalReferrals: number
  pendingCommissions: number
  confirmedCommissions: number
  conversionRate: number
  averageOrderValue: number
}

// Validate if a code is an affiliate code
export async function validateAffiliateCode(code: string): Promise<{
  isValid: boolean
  affiliateCode?: AffiliateCode & { affiliate: Affiliate }
  error?: string
}> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from("affiliate_codes")
      .select(`
        *,
        affiliate:affiliates(*)
      `)
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return { isValid: false, error: "Invalid affiliate code" }
    }

    // Check if affiliate is active
    if (data.affiliate.status !== "active") {
      return { isValid: false, error: "Affiliate code is inactive" }
    }

    return {
      isValid: true,
      affiliateCode: data as AffiliateCode & { affiliate: Affiliate },
    }
  } catch (error) {
    console.error("Error validating affiliate code:", error)
    return { isValid: false, error: "Error validating affiliate code" }
  }
}

// Record affiliate transaction
export async function recordAffiliateTransaction(
  affiliateCodeId: string,
  affiliateId: string,
  orderNumber: string,
  customerEmail: string,
  orderTotal: number,
  commissionRate: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const commissionAmount = orderTotal * commissionRate

    // Insert transaction
    const { error: transactionError } = await supabaseAdmin.from("affiliate_transactions").insert({
      affiliate_code_id: affiliateCodeId,
      affiliate_id: affiliateId,
      order_number: orderNumber,
      customer_email: customerEmail,
      order_total: orderTotal,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: "pending",
    })

    if (transactionError) {
      throw transactionError
    }

    // Get current usage count
    const { data: codeData, error: getCodeError } = await supabaseAdmin
      .from("affiliate_codes")
      .select("usage_count")
      .eq("id", affiliateCodeId)
      .single()

    if (getCodeError) {
      console.error("Error getting code usage count:", getCodeError)
    } else {
      // Update affiliate code usage count
      const { error: codeError } = await supabaseAdmin
        .from("affiliate_codes")
        .update({
          usage_count: (codeData?.usage_count || 0) + 1,
        })
        .eq("id", affiliateCodeId)

      if (codeError) {
        console.error("Error updating code usage count:", codeError)
      }
    }

    // Get current affiliate totals
    const { data: affiliateData, error: getAffiliateError } = await supabaseAdmin
      .from("affiliates")
      .select("total_earnings, total_referrals")
      .eq("id", affiliateId)
      .single()

    if (getAffiliateError) {
      console.error("Error getting affiliate totals:", getAffiliateError)
    } else {
      // Update affiliate totals
      const { error: affiliateError } = await supabaseAdmin
        .from("affiliates")
        .update({
          total_earnings: (affiliateData?.total_earnings || 0) + commissionAmount,
          total_referrals: (affiliateData?.total_referrals || 0) + 1,
        })
        .eq("id", affiliateId)

      if (affiliateError) {
        console.error("Error updating affiliate totals:", affiliateError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error recording affiliate transaction:", error)
    return { success: false, error: "Failed to record affiliate transaction" }
  }
}

// Get affiliate by code
export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from("affiliate_codes")
      .select("affiliate:affiliates(*)")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return null
    }

    return data.affiliate as unknown as Affiliate
  } catch (error) {
    console.error("Error getting affiliate by code:", error)
    return null
  }
}

// Get affiliate statistics
export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: transactions, error } = await supabaseAdmin
      .from("affiliate_transactions")
      .select("*")
      .eq("affiliate_id", affiliateId)

    if (error) {
      throw error
    }

    const totalEarnings = transactions.reduce((sum, t) => sum + Number(t.commission_amount), 0)
    const totalReferrals = transactions.length
    const pendingCommissions = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + Number(t.commission_amount), 0)
    const confirmedCommissions = transactions
      .filter((t) => t.status === "confirmed" || t.status === "paid")
      .reduce((sum, t) => sum + Number(t.commission_amount), 0)

    const averageOrderValue =
      totalReferrals > 0 ? transactions.reduce((sum, t) => sum + Number(t.order_total), 0) / totalReferrals : 0

    return {
      totalEarnings,
      totalReferrals,
      pendingCommissions,
      confirmedCommissions,
      conversionRate: 0, // Would need additional data to calculate
      averageOrderValue,
    }
  } catch (error) {
    console.error("Error getting affiliate stats:", error)
    return {
      totalEarnings: 0,
      totalReferrals: 0,
      pendingCommissions: 0,
      confirmedCommissions: 0,
      conversionRate: 0,
      averageOrderValue: 0,
    }
  }
}

// Get all affiliates with stats
export async function getAllAffiliatesWithStats(): Promise<(Affiliate & { stats: AffiliateStats })[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: affiliates, error } = await supabaseAdmin
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    const affiliatesWithStats = await Promise.all(
      affiliates.map(async (affiliate) => {
        const stats = await getAffiliateStats(affiliate.id)
        return { ...affiliate, stats }
      }),
    )

    return affiliatesWithStats
  } catch (error) {
    console.error("Error getting affiliates with stats:", error)
    return []
  }
}

// Get affiliate transactions
export async function getAffiliateTransactions(
  affiliateId?: string,
  limit = 50,
  offset = 0,
): Promise<AffiliateTransaction[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin
      .from("affiliate_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (affiliateId) {
      query = query.eq("affiliate_id", affiliateId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error getting affiliate transactions:", error)
    return []
  }
}

// Create new affiliate
export async function createAffiliate(
  name: string,
  email: string,
  commissionRate = 0.1,
): Promise<{ success: boolean; affiliate?: Affiliate; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from("affiliates")
      .insert({
        name,
        email,
        commission_rate: commissionRate,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { success: true, affiliate: data }
  } catch (error) {
    console.error("Error creating affiliate:", error)
    return { success: false, error: "Failed to create affiliate" }
  }
}

// Create affiliate code
export async function createAffiliateCode(
  affiliateId: string,
  code: string,
  discountPercentage = 0,
): Promise<{ success: boolean; affiliateCode?: AffiliateCode; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from("affiliate_codes")
      .insert({
        affiliate_id: affiliateId,
        code: code.toUpperCase(),
        discount_percentage: discountPercentage,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { success: true, affiliateCode: data }
  } catch (error) {
    console.error("Error creating affiliate code:", error)
    return { success: false, error: "Failed to create affiliate code" }
  }
}
