import { getSupabaseAdmin } from "./supabase"

export type DiscountType = "percentage" | "fixed"

export interface Discount {
  id: string
  code: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  min_purchase_amount: number
  max_discount_amount: number | null
  start_date: string
  end_date: string | null
  usage_limit: number | null
  usage_limit_per_customer: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DiscountUsage {
  id: string
  discount_id: string
  order_id: string
  customer_email: string
  amount_saved: number
  created_at: string
}

export interface DiscountValidationResult {
  isValid: boolean
  discount?: Discount
  error?: string
}

export interface DiscountApplicationResult {
  subtotal: number
  discountAmount: number
  total: number
  discount: Discount
}

export interface DiscountUsageStats {
  totalUses: number
  totalAmountSaved: number
  usageByCustomer: { email: string; uses: number; amountSaved: number }[]
}

// Validate a discount code
export async function validateDiscountCode(
  code: string,
  subtotal: number,
  customerEmail?: string,
): Promise<DiscountValidationResult> {
  try {
    // Normalize code (uppercase, trim whitespace)
    const normalizedCode = code.trim().toUpperCase()

    const supabaseAdmin = getSupabaseAdmin()
    // Query the discount
    const { data: discount, error } = await supabaseAdmin
      .from("discounts")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single()

    if (error || !discount) {
      return { isValid: false, error: "Invalid discount code" }
    }

    const now = new Date()

    // Check if discount is active
    if (!discount.is_active) {
      return { isValid: false, error: "This discount code is inactive" }
    }

    // Check date range
    if (new Date(discount.start_date) > now) {
      return { isValid: false, error: "This discount code is not yet active" }
    }

    if (discount.end_date && new Date(discount.end_date) < now) {
      return { isValid: false, error: "This discount code has expired" }
    }

    // Check minimum purchase amount
    if (subtotal < discount.min_purchase_amount) {
      return {
        isValid: false,
        error: `This discount requires a minimum purchase of $${discount.min_purchase_amount.toFixed(2)}`,
      }
    }

    // Check usage limits if customer email is provided
    if (customerEmail && discount.usage_limit_per_customer) {
      const { count, error: countError } = await supabaseAdmin
        .from("discount_usage")
        .select("*", { count: "exact", head: true })
        .eq("discount_id", discount.id)
        .eq("customer_email", customerEmail)

      if (!countError && count && count >= discount.usage_limit_per_customer) {
        return {
          isValid: false,
          error: `You have reached the maximum usage limit for this discount code`,
        }
      }
    }

    // Check total usage limit
    if (discount.usage_limit) {
      const { count, error: countError } = await supabaseAdmin
        .from("discount_usage")
        .select("*", { count: "exact", head: true })
        .eq("discount_id", discount.id)

      if (!countError && count && count >= discount.usage_limit) {
        return {
          isValid: false,
          error: `This discount code has reached its usage limit`,
        }
      }
    }

    // All checks passed
    return { isValid: true, discount }
  } catch (error) {
    console.error("Error validating discount code:", error)
    return { isValid: false, error: "An error occurred while validating the discount code" }
  }
}

// Apply a discount to a subtotal
export function applyDiscount(discount: Discount, subtotal: number): DiscountApplicationResult {
  let discountAmount = 0

  if (discount.discount_type === "percentage") {
    discountAmount = subtotal * (discount.discount_value / 100)
  } else {
    discountAmount = discount.discount_value
  }

  // Apply maximum discount cap if set
  if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
    discountAmount = discount.max_discount_amount
  }

  // Ensure discount doesn't exceed subtotal
  if (discountAmount > subtotal) {
    discountAmount = subtotal
  }

  const total = subtotal - discountAmount

  return {
    subtotal,
    discountAmount,
    total,
    discount,
  }
}

// Record discount usage
export async function recordDiscountUsage(
  discountId: string,
  orderId: string,
  customerEmail: string,
  amountSaved: number,
): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from("discount_usage").insert({
      discount_id: discountId,
      order_id: orderId,
      customer_email: customerEmail,
      amount_saved: amountSaved,
    })

    return !error
  } catch (error) {
    console.error("Error recording discount usage:", error)
    return false
  }
}

// Get discount usage statistics
export async function getDiscountUsageStats(discountId: string): Promise<DiscountUsageStats | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    // Get all usage records for this discount
    const { data, error } = await supabaseAdmin.from("discount_usage").select("*").eq("discount_id", discountId)

    if (error || !data) {
      return null
    }

    // Calculate total uses and amount saved
    const totalUses = data.length
    const totalAmountSaved = data.reduce((sum, record) => sum + record.amount_saved, 0)

    // Group by customer
    const customerMap = new Map<string, { uses: number; amountSaved: number }>()

    for (const record of data) {
      const existing = customerMap.get(record.customer_email) || { uses: 0, amountSaved: 0 }
      customerMap.set(record.customer_email, {
        uses: existing.uses + 1,
        amountSaved: existing.amountSaved + record.amount_saved,
      })
    }

    const usageByCustomer = Array.from(customerMap.entries()).map(([email, stats]) => ({
      email,
      uses: stats.uses,
      amountSaved: stats.amountSaved,
    }))

    return {
      totalUses,
      totalAmountSaved,
      usageByCustomer,
    }
  } catch (error) {
    console.error("Error getting discount usage stats:", error)
    return null
  }
}

// Create a new discount
export async function createDiscount(
  discount: Omit<Discount, "id" | "created_at" | "updated_at">,
): Promise<Discount | null> {
  try {
    // Normalize code to uppercase
    const normalizedDiscount = {
      ...discount,
      code: discount.code.trim().toUpperCase(),
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from("discounts").insert(normalizedDiscount).select().single()

    if (error || !data) {
      console.error("Error creating discount:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creating discount:", error)
    return null
  }
}

// Update an existing discount
export async function updateDiscount(id: string, discount: Partial<Discount>): Promise<Discount | null> {
  try {
    // If code is being updated, normalize it
    const normalizedDiscount = discount.code ? { ...discount, code: discount.code.trim().toUpperCase() } : discount

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from("discounts")
      .update(normalizedDiscount)
      .eq("id", id)
      .select()
      .single()

    if (error || !data) {
      console.error("Error updating discount:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating discount:", error)
    return null
  }
}

// Delete a discount
export async function deleteDiscount(id: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from("discounts").delete().eq("id", id)

    return !error
  } catch (error) {
    console.error("Error deleting discount:", error)
    return false
  }
}

// Get all discounts
export async function getAllDiscounts(): Promise<Discount[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from("discounts").select("*").order("created_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return data
  } catch (error) {
    console.error("Error getting all discounts:", error)
    return []
  }
}

// Get a discount by ID
export async function getDiscountById(id: string): Promise<Discount | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from("discounts").select("*").eq("id", id).single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting discount by ID:", error)
    return null
  }
}

// Get a discount by code
export async function getDiscountByCode(code: string): Promise<Discount | null> {
  try {
    const normalizedCode = code.trim().toUpperCase()

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from("discounts").select("*").eq("code", normalizedCode).single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting discount by code:", error)
    return null
  }
}
