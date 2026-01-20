import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test SMS subscribers table
    const { data: smsTest, error: smsError } = await supabase
      .from('sms_discount_codes')
      .select('phone_number')
      .limit(1)

    // Test imported_sms table
    const { data: importedTest, error: importedError } = await supabase
      .from('imported_sms')
      .select('*')
      .limit(1)

    return NextResponse.json({
      sms_discount_codes: {
        exists: !smsError,
        error: smsError?.message || null
      },
      imported_sms: {
        exists: !importedError,
        error: importedError?.message || null,
        hasCountryColumns: importedTest && importedTest.length > 0 ? 
          'country_name' in importedTest[0] : false
      }
    })

  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json({ error: 'Failed to check tables' }, { status: 500 })
  }
}
