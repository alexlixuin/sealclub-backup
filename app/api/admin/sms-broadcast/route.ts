import { NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

// Log environment variables for debugging (without exposing sensitive data)
console.log("Twilio Environment Check:")
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...` : "NOT SET")
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? `${process.env.TWILIO_AUTH_TOKEN.substring(0, 10)}...` : "NOT SET")
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER || "NOT SET")

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

interface BroadcastRequest {
  phoneNumbers: string[]
  message: string
}

export async function POST(request: NextRequest) {
  try {
    // Validate Twilio environment variables
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.error("TWILIO_ACCOUNT_SID is not set")
      return NextResponse.json(
        { error: "Twilio Account SID not configured" },
        { status: 500 }
      )
    }

    if (!process.env.TWILIO_AUTH_TOKEN) {
      console.error("TWILIO_AUTH_TOKEN is not set")
      return NextResponse.json(
        { error: "Twilio Auth Token not configured" },
        { status: 500 }
      )
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error("TWILIO_PHONE_NUMBER is not set")
      return NextResponse.json(
        { error: "Twilio Phone Number not configured" },
        { status: 500 }
      )
    }

    const { phoneNumbers, message }: BroadcastRequest = await request.json()

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: "Phone numbers array is required" },
        { status: 400 }
      )
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const results = []
    let successCount = 0
    let failedCount = 0

    console.log(`Starting SMS broadcast to ${phoneNumbers.length} numbers`)
    console.log(`Using Twilio phone number: ${process.env.TWILIO_PHONE_NUMBER}`)

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      try {
        console.log(`Attempting to send SMS to: ${phoneNumber}`)
        
        const smsMessage = await client.messages.create({
          body: message.trim(),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        })

        results.push({
          phoneNumber,
          success: true,
          messageId: smsMessage.sid,
          status: smsMessage.status
        })
        successCount++

        console.log(`SMS sent successfully to ${phoneNumber}: ${smsMessage.sid}`)

        // Add small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error: any) {
        console.error(`Failed to send SMS to ${phoneNumber}:`)
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          moreInfo: error.moreInfo,
          status: error.status,
          details: error.details
        })
        
        results.push({
          phoneNumber,
          success: false,
          error: error.message || "Unknown error",
          code: error.code,
          details: error.details
        })
        failedCount++
      }
    }

    // Log the broadcast summary
    console.log(`SMS Broadcast completed: ${successCount} successful, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      message: "Broadcast completed",
      successCount,
      failedCount,
      totalSent: phoneNumbers.length,
      results
    })

  } catch (error) {
    console.error("SMS broadcast error:", error)
    return NextResponse.json(
      { error: "Failed to send broadcast messages" },
      { status: 500 }
    )
  }
}
