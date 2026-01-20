import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET(request: Request) {
  try {
    console.log("🔍 [RESEND-TEST] Testing Resend API configuration")

    // Get the email from the query parameters
    const url = new URL(request.url)
    const email = url.searchParams.get("email") || "test@example.com"

    // Check if RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ [RESEND-TEST] RESEND_API_KEY is not set")
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY environment variable is not set",
        },
        { status: 500 },
      )
    }

    console.log(`🔍 [RESEND-TEST] RESEND_API_KEY is set (first 4 chars: ${process.env.RESEND_API_KEY.substring(0, 4)})`)

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send a test email
    console.log(`🔍 [RESEND-TEST] Sending test email to ${email}`)
    const { data, error } = await resend.emails.send({
      from: "OZPTides Test <onboarding@resend.dev>",
      to: [email],
      subject: "Resend API Test",
      html: `
        <html>
          <body>
            <h1>Resend API Test</h1>
            <p>This is a test email to verify that the Resend API is working correctly.</p>
            <p>Time sent: ${new Date().toISOString()}</p>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("❌ [RESEND-TEST] Error sending test email:", error)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send test email: ${error.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ [RESEND-TEST] Test email sent successfully", {
      emailId: data?.id,
      recipient: email,
    })

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("❌ [RESEND-TEST] Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
