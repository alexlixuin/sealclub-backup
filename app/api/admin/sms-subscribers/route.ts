import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get all unique phone numbers from SMS discount codes with stats
    const { data: subscribers, error } = await supabase
      .from('sms_discount_codes')
      .select(`
        phone_number,
        created_at,
        used
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group by phone number and calculate stats
    const subscriberMap = new Map()
    
    subscribers?.forEach(record => {
      const phone = record.phone_number
      if (!subscriberMap.has(phone)) {
        subscriberMap.set(phone, {
          phone_number: phone,
          created_at: record.created_at,
          discount_codes_count: 0,
          last_code_used: false
        })
      }
      
      const subscriber = subscriberMap.get(phone)
      subscriber.discount_codes_count++
      
      // Update if this is a more recent usage
      if (record.used) {
        subscriber.last_code_used = true
      }
      
      // Keep the earliest created_at date
      if (new Date(record.created_at) < new Date(subscriber.created_at)) {
        subscriber.created_at = record.created_at
      }
    })

    const uniqueSubscribers = Array.from(subscriberMap.values())

    return NextResponse.json({
      success: true,
      subscribers: uniqueSubscribers,
      total: uniqueSubscribers.length
    })

  } catch (error) {
    console.error("Error fetching SMS subscribers:", error)
    return NextResponse.json(
      { error: "Failed to fetch SMS subscribers" },
      { status: 500 }
    )
  }
}
