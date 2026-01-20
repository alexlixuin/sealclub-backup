import { getSupabaseAdmin } from "./supabase"
import { validateAffiliateCode } from "./affiliate-service"

export type DiscountType = "percentage" | "fixed"

export type Discount = {
  id: string
  code: string
  type: DiscountType
  value: number
  description?: string
  min_order_amount?: number
  max_uses?: number
  current_uses: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SMSDiscountCode = {
  id: string
  code: string
  phone_number: string
  discount_percentage: number
  used: boolean
  used_at?: string
  expires_at: string
  created_at: string
  updated_at: string
}

export type CodeValidationResult = {
  isValid: boolean
  type: "discount" | "affiliate" | "sms" | "invalid"
  discount?: Discount
  affiliateCode?: any
  smsCode?: SMSDiscountCode
  error?: string
}

// Enhanced validation that checks discount codes, affiliate codes, and SMS codes
export async function validateCode(
  code: string,
  subtotal: number,
  customerEmail?: string,
): Promise<CodeValidationResult> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // First, check if it's an SMS discount code
    const { data: smsCode, error: smsError } = await supabaseAdmin
      .from("sms_discount_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("used", false)
      .single()

    if (!smsError && smsCode) {
      // Check if SMS code is expired
      const now = new Date()
      const expiresAt = new Date(smsCode.expires_at)
      
      if (now > expiresAt) {
        return {
          isValid: false,
          type: "invalid",
          error: "SMS discount code has expired",
        }
      }

      return {
        isValid: true,
        type: "sms",
        smsCode: smsCode as SMSDiscountCode,
      }
    }

    // Second, check if it's an affiliate code
    const affiliateResult = await validateAffiliateCode(code)

    if (affiliateResult.isValid && affiliateResult.affiliateCode) {
      return {
        isValid: true,
        type: "affiliate",
        affiliateCode: affiliateResult.affiliateCode,
      }
    }

    // Finally, check if it's a regular discount code
    const { data: discount, error } = await supabaseAdmin
      .from("discounts")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !discount) {
      return {
        isValid: false,
        type: "invalid",
        error: "Invalid code",
      }
    }

    // Check if discount is within valid date range
    const now = new Date()
    const validFrom = new Date(discount.valid_from)
    const validUntil = new Date(discount.valid_until)

    if (now < validFrom || now > validUntil) {
      return {
        isValid: false,
        type: "invalid",
        error: "Code has expired or is not yet valid",
      }
    }

    // Check usage limits
    if (discount.max_uses && discount.current_uses >= discount.max_uses) {
      return {
        isValid: false,
        type: "invalid",
        error: "Code usage limit reached",
      }
    }

    // Check minimum order amount
    if (discount.min_order_amount && subtotal < discount.min_order_amount) {
      return {
        isValid: false,
        type: "invalid",
        error: `Minimum order amount of $${discount.min_order_amount} required`,
      }
    }

    return {
      isValid: true,
      type: "discount",
      discount: discount as Discount,
    }
  } catch (error) {
    console.error("Error validating code:", error)
    return {
      isValid: false,
      type: "invalid",
      error: "Error validating code",
    }
  }
}

// Apply discount (for regular discount codes)
export function applyDiscount(discount: Discount, subtotal: number) {
  let discountAmount = 0

  if (discount.type === "percentage") {
    discountAmount = (subtotal * discount.value) / 100
  } else if (discount.type === "fixed") {
    discountAmount = Math.min(discount.value, subtotal)
  }

  const total = Math.max(0, subtotal - discountAmount)

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

// Apply SMS discount code
export function applySMSDiscount(smsCode: SMSDiscountCode, subtotal: number) {
  console.log('SMS Discount Debug:', {
    code: smsCode.code,
    discount_percentage: smsCode.discount_percentage,
    subtotal: subtotal,
    calculation: `${subtotal} * ${smsCode.discount_percentage} / 100`
  })
  
  const discountAmount = (subtotal * smsCode.discount_percentage) / 100
  const total = Math.max(0, subtotal - discountAmount)

  console.log('SMS Discount Result:', {
    discountAmount: discountAmount,
    total: total
  })

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

// Apply affiliate code (may include discount for customer)
export function applyAffiliateCode(affiliateCode: any, subtotal: number) {
  let discountAmount = 0

  if (affiliateCode.discount_percentage > 0) {
    discountAmount = (subtotal * affiliateCode.discount_percentage) / 100
  }

  const total = Math.max(0, subtotal - discountAmount)

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    affiliateInfo: {
      affiliateId: affiliateCode.affiliate_id,
      affiliateCodeId: affiliateCode.id,
      commissionRate: affiliateCode.affiliate.commission_rate,
    },
  }
}

// Mark SMS discount code as used
export async function markSMSCodeAsUsed(codeId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from("sms_discount_codes")
      .update({ 
        used: true, 
        used_at: new Date().toISOString() 
      })
      .eq("id", codeId)

    return !error
  } catch (error) {
    console.error("Error marking SMS code as used:", error)
    return false
  }
}
