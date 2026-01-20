import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Country code to country name mapping
const countryCodeMap: { [key: string]: string } = {
  '+1': 'United States',
  '+44': 'United Kingdom', 
  '+61': 'Australia',
  '+64': 'New Zealand',
  '+33': 'France',
  '+49': 'Germany',
  '+81': 'Japan',
  '+86': 'China',
  '+91': 'India',
  '+7': 'Russia',
  '+55': 'Brazil',
  '+52': 'Mexico',
  '+39': 'Italy',
  '+34': 'Spain',
  '+31': 'Netherlands',
  '+46': 'Sweden',
  '+47': 'Norway',
  '+45': 'Denmark',
  '+358': 'Finland',
  '+41': 'Switzerland',
  '+43': 'Austria',
  '+32': 'Belgium',
  '+351': 'Portugal',
  '+353': 'Ireland',
  '+420': 'Czech Republic',
  '+48': 'Poland',
  '+36': 'Hungary',
  '+30': 'Greece',
  '+90': 'Turkey',
  '+972': 'Israel',
  '+971': 'UAE',
  '+966': 'Saudi Arabia',
  '+65': 'Singapore',
  '+60': 'Malaysia',
  '+66': 'Thailand',
  '+84': 'Vietnam',
  '+62': 'Indonesia',
  '+63': 'Philippines',
  '+82': 'South Korea',
  '+886': 'Taiwan',
  '+852': 'Hong Kong',
  '+27': 'South Africa',
  '+234': 'Nigeria',
  '+20': 'Egypt',
  '+54': 'Argentina',
  '+56': 'Chile',
  '+57': 'Colombia',
  '+51': 'Peru',
  '+58': 'Venezuela'
}

function getCountryFromPhoneNumber(phoneNumber: string): { code: string | null, name: string | null } {
  // Remove + and any non-digits
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '')
  
  // Try to match country codes (longest first)
  const sortedCodes = Object.keys(countryCodeMap).sort((a, b) => b.length - a.length)
  
  for (const code of sortedCodes) {
    const codeDigits = code.replace('+', '')
    if (cleanNumber.startsWith(codeDigits)) {
      return { code, name: countryCodeMap[code] }
    }
  }
  
  return { code: null, name: null }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumbers } = await request.json()

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return NextResponse.json({ error: 'Phone numbers array is required' }, { status: 400 })
    }

    // Prepare data for bulk insert with country information
    const importData = phoneNumbers.map(phone => {
      const country = getCountryFromPhoneNumber(phone)
      return {
        phone_number: phone,
        country_code: country.code,
        country_name: country.name,
        source: 'order_logs',
        imported_at: new Date().toISOString(),
        is_active: true
      }
    })

    // Insert phone numbers (ignore duplicates)
    const { data, error } = await supabase
      .from('imported_sms')
      .upsert(importData, { 
        onConflict: 'phone_number',
        ignoreDuplicates: true 
      })
      .select()

    if (error) {
      console.error('Error importing phone numbers:', error)
      return NextResponse.json({ error: 'Failed to import phone numbers' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: phoneNumbers.length
    })

  } catch (error) {
    console.error('Error in import-sms-numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryFilter = searchParams.get('country')

    // Try to fetch data, handle table not existing gracefully
    const { data: importedNumbers, error } = await supabase
      .from('imported_sms')
      .select('id, phone_number, country_code, country_name, source, imported_at, is_active, notes')
      .eq('is_active', true)
      .order('imported_at', { ascending: false })

    // If table doesn't exist or has missing columns, return empty data
    if (error) {
      console.log('imported_sms table may not exist or missing columns:', error.message)
      return NextResponse.json({
        success: true,
        numbers: [],
        countryStatistics: {},
        totalNumbers: 0
      })
    }

    // Apply country filter if specified and data exists
    let filteredNumbers = importedNumbers || []
    if (countryFilter && countryFilter !== 'all' && filteredNumbers.length > 0) {
      filteredNumbers = filteredNumbers.filter(num => num.country_name === countryFilter)
    }

    // Calculate country statistics from available data
    const countryStatistics = (importedNumbers || []).reduce((acc: any, item) => {
      const country = item.country_name || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      numbers: filteredNumbers,
      countryStatistics,
      totalNumbers: filteredNumbers.length
    })

  } catch (error) {
    console.error('Error in import-sms-numbers GET:', error)
    return NextResponse.json({ 
      success: true, 
      numbers: [], 
      countryStatistics: {},
      totalNumbers: 0
    })
  }
}
