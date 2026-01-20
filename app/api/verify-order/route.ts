import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize both test and live Stripe clients
const testStripe = new Stripe(process.env.STRIPE_TEST_KEY || "", {
  apiVersion: "2025-04-30.basil",
})

const liveStripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerEmail, orderNumber } = await request.json()

    console.log("[v0] verify-order: Verifying order", orderNumber, "for email", customerEmail)
    console.log("[v0] verify-order: Session ID", sessionId)

    if (!sessionId || !customerEmail || !orderNumber) {
      return NextResponse.json({
        verified: false,
        reason: "Missing required parameters",
      })
    }

    // Try to verify with both test and live Stripe
    const verificationResults = await Promise.allSettled([
      verifyWithStripe(testStripe, sessionId, customerEmail, orderNumber, "TEST"),
      verifyWithStripe(liveStripe, sessionId, customerEmail, orderNumber, "LIVE"),
    ])

    console.log("[v0] verify-order: Verification results", verificationResults)

    // Check if either verification succeeded
    for (const result of verificationResults) {
      if (result.status === "fulfilled" && result.value.verified) {
        console.log("[v0] verify-order: Order verified successfully with", result.value.mode, "mode")
        return NextResponse.json(result.value)
      }
    }

    // If both failed, return the first error
    const firstError = verificationResults.find((r) => r.status === "fulfilled")
    if (firstError && firstError.status === "fulfilled") {
      return NextResponse.json(firstError.value)
    }

    return NextResponse.json({
      verified: false,
      reason: "Failed to verify with both test and live Stripe",
    })
  } catch (error) {
    console.error("[v0] verify-order: Error verifying order:", error)
    return NextResponse.json({
      verified: false,
      reason: "Internal server error during verification",
    })
  }
}

async function verifyWithStripe(
  stripe: Stripe,
  sessionId: string,
  customerEmail: string,
  orderNumber: string,
  mode: "TEST" | "LIVE",
): Promise<{ verified: boolean; reason?: string; mode?: string; sessionData?: any }> {
  try {
    console.log("[v0] verify-order: Attempting verification with", mode, "Stripe")

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "line_items"],
    })

    console.log("[v0] verify-order:", mode, "session retrieved:", {
      id: session.id,
      customer_email: session.customer_details?.email,
      payment_status: session.payment_status,
      metadata: session.metadata,
    })

    // Verify the session belongs to the customer
    if (session.customer_details?.email?.toLowerCase() !== customerEmail.toLowerCase()) {
      return {
        verified: false,
        reason: `Email mismatch in ${mode} mode: expected ${customerEmail}, got ${session.customer_details?.email}`,
      }
    }

    // Verify the order number matches
    if (session.metadata?.order_number !== orderNumber.toString()) {
      return {
        verified: false,
        reason: `Order number mismatch in ${mode} mode: expected ${orderNumber}, got ${session.metadata?.order_number}`,
      }
    }

    // Verify the payment was successful
    if (session.payment_status !== "paid") {
      return {
        verified: false,
        reason: `Payment not completed in ${mode} mode: status is ${session.payment_status}`,
      }
    }

    console.log("[v0] verify-order: Order successfully verified with", mode, "Stripe")

    return {
      verified: true,
      mode: mode,
      sessionData: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        created: session.created,
      },
    }
  } catch (error: any) {
    console.log("[v0] verify-order:", mode, "verification failed:", error.message)

    // If it's a "No such checkout session" error, that's expected for the wrong mode
    if (error.code === "resource_missing") {
      return {
        verified: false,
        reason: `Session not found in ${mode} mode`,
      }
    }

    return {
      verified: false,
      reason: `${mode} verification error: ${error.message}`,
    }
  }
}
