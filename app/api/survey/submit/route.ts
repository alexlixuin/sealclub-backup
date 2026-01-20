import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClientSafe } from '@/lib/supabase'

interface SurveyData {
  email: string
  steroidsInterest: 'yes' | 'no' | ''
  steroidsPurchaseIntent: string
  customerBarrier: string
  confidenceFactors: string
  primaryInterest: string
  referenceCode: string
}

// Function to get country from headers
function getCountryFromHeaders(headersList: Headers): string {
  const country = headersList.get('x-country')
  return country || 'Unknown'
}

// Function to get country from IP
async function getCountryFromIP(ipAddress: string): Promise<string> {
  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    const data = await response.json()
    return data.country_name || 'Unknown'
  } catch (error) {
    console.error('Error getting country from IP:', error)
    return 'Unknown'
  }
}

// Function to get country from timezone
function getCountryFromTimezone(): string {
  // This function is not implemented as it's not clear how to get country from timezone
  // You may need to use a library or API to achieve this
  return 'Unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const surveyData: SurveyData = await request.json()
    
    // Get client IP address
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const clientIp = forwarded?.split(',')[0] || realIp || 'Unknown'
    
    // Get user agent
    const userAgent = headersList.get('user-agent') || 'Unknown'
    
    // Get country using multiple methods
    const countryFromHeaders = getCountryFromHeaders(headersList)
    const countryFromIP = await getCountryFromIP(clientIp)
    const countryFromTimezone = getCountryFromTimezone()
    
    // Determine best country estimate
    let detectedCountry = 'Unknown'
    let countryMethod = 'Unknown'
    
    if (countryFromHeaders !== 'Unknown') {
      detectedCountry = countryFromHeaders
      countryMethod = 'Headers'
    } else if (countryFromIP !== 'Unknown') {
      detectedCountry = countryFromIP
      countryMethod = 'IP Geolocation'
    } else if (countryFromTimezone !== 'Unknown') {
      detectedCountry = countryFromTimezone
      countryMethod = 'Timezone'
    }
    
    // Store in database
    const supabase = createClientSafe()
    const { error: dbError } = await supabase
      .from('survey_responses')
      .insert({
        reference_code: surveyData.referenceCode,
        email: surveyData.email,
        steroids_interest: surveyData.steroidsInterest,
        steroids_purchase_intent: surveyData.steroidsPurchaseIntent,
        customer_barrier: surveyData.customerBarrier,
        confidence_factors: surveyData.confidenceFactors,
        primary_interest: surveyData.primaryInterest,
        ip_address: clientIp,
        user_agent: userAgent,
        country: detectedCountry,
        country_method: countryMethod,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to store survey data' }, { status: 500 })
    }
    
    // Prepare Discord webhook payload
    const webhookUrl = process.env.DISCORD_SURVEY_WEBHOOK
    
    if (!webhookUrl) {
      console.error('DISCORD_SURVEY_WEBHOOK not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Create formatted message for Discord
    const embed = {
      title: "🔬 New Survey Response",
      color: 0x3B82F6, // Blue color
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "🎫 Reference Code",
          value: `\`${surveyData.referenceCode}\``,
          inline: true
        },
        {
          name: "📧 Email",
          value: surveyData.email,
          inline: true
        },
        {
          name: "🌍 Country",
          value: `${detectedCountry} (${countryMethod})`,
          inline: true
        },
        {
          name: "🌐 IP Address",
          value: clientIp,
          inline: true
        },
        {
          name: "💊 Steroids & Oils Interest",
          value: surveyData.steroidsInterest === 'yes' ? '✅ Yes' : '❌ No',
          inline: true
        }
      ]
    }

    // Add purchase intent if they were interested
    if (surveyData.steroidsInterest === 'yes' && surveyData.steroidsPurchaseIntent) {
      embed.fields.push({
        name: "💰 Purchase Intent",
        value: surveyData.steroidsPurchaseIntent.substring(0, 1000) + (surveyData.steroidsPurchaseIntent.length > 1000 ? '...' : ''),
        inline: false
      })
    }

    // Add customer barriers
    if (surveyData.customerBarrier) {
      embed.fields.push({
        name: "🚧 Customer Barriers",
        value: surveyData.customerBarrier.substring(0, 1000) + (surveyData.customerBarrier.length > 1000 ? '...' : ''),
        inline: false
      })
    }

    // Add confidence factors
    if (surveyData.confidenceFactors) {
      embed.fields.push({
        name: "🛡️ Confidence Factors",
        value: surveyData.confidenceFactors.substring(0, 1000) + (surveyData.confidenceFactors.length > 1000 ? '...' : ''),
        inline: false
      })
    }

    // Add primary interests
    if (surveyData.primaryInterest) {
      embed.fields.push({
        name: "🎯 Primary Interests",
        value: surveyData.primaryInterest.substring(0, 1000) + (surveyData.primaryInterest.length > 1000 ? '...' : ''),
        inline: false
      })
    }

    // Add technical info
    embed.fields.push({
      name: "🔧 Technical Info",
      value: `User Agent: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}`,
      inline: false
    })

    // Add admin instructions
    embed.fields.push({
      name: "📋 Admin Instructions",
      value: "Customer will contact support with reference code. Review answers and provide discount (minimum 5% off). Better answers = higher discount.",
      inline: false
    })

    const discordPayload = {
      embeds: [embed]
    }

    // Send to Discord webhook
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    })

    if (!discordResponse.ok) {
      console.error('Failed to send to Discord:', discordResponse.statusText)
      return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Survey submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
