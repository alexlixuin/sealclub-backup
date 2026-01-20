import { NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

export async function GET() {
  try {
    // Check environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    console.log("=== Twilio Credentials Test ===")
    console.log("Account SID:", accountSid ? `${accountSid.substring(0, 10)}...` : "NOT SET")
    console.log("Auth Token:", authToken ? `${authToken.substring(0, 10)}...` : "NOT SET")
    console.log("Phone Number:", phoneNumber || "NOT SET")

    if (!accountSid || !authToken) {
      return NextResponse.json({
        success: false,
        error: "Missing Twilio credentials",
        details: {
          hasAccountSid: !!accountSid,
          hasAuthToken: !!authToken,
          hasPhoneNumber: !!phoneNumber
        }
      }, { status: 500 })
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken)

    // Test 1: Fetch account details
    console.log("Testing account access...")
    const account = await client.api.accounts(accountSid).fetch()
    
    console.log("Account Status:", account.status)
    console.log("Account Type:", account.type)

    // Test 2: List phone numbers
    console.log("Fetching phone numbers...")
    const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 20 })
    
    const phoneNumberList = phoneNumbers.map(num => ({
      phoneNumber: num.phoneNumber,
      friendlyName: num.friendlyName,
      status: num.status
    }))

    // Test 3: Check if configured number exists
    const configuredNumberExists = phoneNumbers.find(num => num.phoneNumber === phoneNumber)

    return NextResponse.json({
      success: true,
      account: {
        status: account.status,
        type: account.type,
        friendlyName: account.friendlyName
      },
      phoneNumbers: phoneNumberList,
      configuredNumber: {
        number: phoneNumber,
        exists: !!configuredNumberExists,
        details: configuredNumberExists ? {
          friendlyName: configuredNumberExists.friendlyName,
          status: configuredNumberExists.status
        } : null
      },
      message: "Twilio connection successful"
    })

  } catch (error: any) {
    console.error("Twilio test failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status,
      troubleshooting: error.code === 20003 ? {
        possibleCauses: [
          "Invalid Account SID or Auth Token",
          "Account SID and Auth Token don't match",
          "Account is suspended or has restrictions",
          "Credentials have been revoked or expired"
        ],
        recommendation: "Verify credentials in Twilio Console: https://console.twilio.com/"
      } : null
    }, { status: 500 })
  }
}
