import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface SMSVerification {
  id?: string
  phone_number: string
  verification_code: string
  attempts: number
  verified: boolean
  expires_at: string
  created_at?: string
  updated_at?: string
}

export interface SMSDiscountCode {
  id?: string
  code: string
  phone_number: string
  discount_percentage: number
  used: boolean
  used_at?: string
  expires_at: string
  created_at?: string
  updated_at?: string
}

export interface SMSRateLimit {
  id?: string
  phone_number: string
  request_count: number
  reset_time: string
  created_at?: string
  updated_at?: string
}

// SMS Verification functions
export async function createSMSVerification(data: Omit<SMSVerification, 'id' | 'created_at' | 'updated_at'>) {
  const { data: result, error } = await supabase
    .from('sms_verifications')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getSMSVerification(phoneNumber: string) {
  const { data, error } = await supabase
    .from('sms_verifications')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

export async function updateSMSVerification(id: string, updates: Partial<SMSVerification>) {
  const { data, error } = await supabase
    .from('sms_verifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSMSVerification(id: string) {
  const { error } = await supabase
    .from('sms_verifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Discount Code functions
export async function createDiscountCode(data: Omit<SMSDiscountCode, 'id' | 'created_at' | 'updated_at'>) {
  const { data: result, error } = await supabase
    .from('sms_discount_codes')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getDiscountCode(code: string) {
  const { data, error } = await supabase
    .from('sms_discount_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function markDiscountCodeAsUsed(code: string) {
  const { data, error } = await supabase
    .from('sms_discount_codes')
    .update({ 
      used: true, 
      used_at: new Date().toISOString() 
    })
    .eq('code', code)
    .select()
    .single()

  if (error) throw error
  return data
}

// Rate Limiting functions
export async function getRateLimit(phoneNumber: string) {
  const { data, error } = await supabase
    .from('sms_rate_limits')
    .select('*')
    .eq('phone_number', phoneNumber)
    .gt('reset_time', new Date().toISOString())
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createOrUpdateRateLimit(phoneNumber: string, resetTime: string) {
  // Try to update existing rate limit
  const existing = await getRateLimit(phoneNumber)
  
  if (existing) {
    const { data, error } = await supabase
      .from('sms_rate_limits')
      .update({ 
        request_count: existing.request_count + 1 
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Create new rate limit
    const { data, error } = await supabase
      .from('sms_rate_limits')
      .insert({
        phone_number: phoneNumber,
        request_count: 1,
        reset_time: resetTime
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Cleanup function
export async function cleanupExpiredRecords() {
  const { data, error } = await supabase.rpc('cleanup_expired_sms_records')
  
  if (error) throw error
  return data
}
