import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('Received update-sms-country request:', request.body)
    const { phoneNumber, countryName, countryCode } = await request.json()
    console.log('Parsed request:', { phoneNumber, countryName, countryCode })

    if (!phoneNumber) {
      console.error('Missing phone number in request')
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    console.log('Checking if record exists for phone number:', phoneNumber)
    
    // First, ensure the record exists
    const { data: existing, error: fetchError } = await supabase
      .from('imported_sms')
      .select('id, phone_number, country_name, country_code')
      .eq('phone_number', phoneNumber)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
      console.error('Error checking for existing record:', fetchError)
      return NextResponse.json(
        { error: "Database error checking for record" },
        { status: 500 }
      )
    }

    console.log('Existing record:', existing)
    console.log('Attempting to upsert record with:', { 
      phoneNumber, 
      countryName, 
      countryCode,
      updated_at: new Date().toISOString()
    })

    // Update the record using the existing function
    const { data, error } = await supabase.rpc('update_sms_country', {
      p_phone_number: phoneNumber,
      p_country_name: countryName || null,
      p_country_code: countryCode || null
    })

    if (error) {
      console.error('Error updating country info:', error)
      return NextResponse.json(
        { error: "Failed to update country information" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in update-sms-country:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
