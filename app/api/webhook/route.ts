import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { STRIPE_TEST_MODE } from "@/lib/config"
import { logCheckoutEvent, updateOrderStatus } from "@/lib/order-logger"
import { createClient } from "@/lib/supabase"
import { sendOrderConfirmationEmail } from "@/lib/email-service"
import { mapDbOrderToAppFormat } from "@/lib/order-utils"

// Get the appropriate Stripe keys based on mode
const stripeSecretKey = STRIPE_TEST_MODE ? process.env.STRIPE_TEST_KEY || "" : process.env.STRIPE_SECRET_KEY || ""

// Validate that we have a key
if (!stripeSecretKey) {
  throw new Error(
    `Stripe ${STRIPE_TEST_MODE ? "test" : "live"} key is not set. Please check your environment variables.`,
  )
}

// Get the appropriate webhook secret based on mode
const webhookSecret = STRIPE_TEST_MODE
  ? process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ""
  : process.env.STRIPE_WEBHOOK_SECRET || ""

// Validate that we have a webhook secret
if (!webhookSecret) {
  throw new Error(
    `Stripe ${STRIPE_TEST_MODE ? "test" : "live"} webhook secret is not set. Please check your environment variables.`,
  )
}

// Initialize Stripe with the appropriate key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil",
})

// Log the current Stripe mode
console.log(`Webhook handler initialized in ${STRIPE_TEST_MODE ? "TEST" : "LIVE"} mode`)
console.log(
  `Using Stripe key: ${stripeSecretKey.substring(0, 8)}...${stripeSecretKey.substring(stripeSecretKey.length - 4)}`,
)

export async function POST(request: Request) {
  try {
    console.log("🔍 [WEBHOOK] Received webhook request")
    const body = await request.text()
    // Fix: Await the headers() call
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      console.error("❌ [WEBHOOK] Missing stripe-signature header")
      await logCheckoutEvent("webhook_error", {
        error: "Missing stripe-signature header",
        isTestMode: STRIPE_TEST_MODE,
      })
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      console.log("🔍 [WEBHOOK] Verifying webhook signature")
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log(`✅ [WEBHOOK] Signature verified, event type: ${event.type}`)
    } catch (err) {
      const error = err as Error
      console.error(`❌ [WEBHOOK] Signature verification failed: ${error.message}`)
      await logCheckoutEvent("webhook_error", {
        error: `Webhook signature verification failed: ${error.message}`,
        isTestMode: STRIPE_TEST_MODE,
      })
      return NextResponse.json({ error: `Webhook signature verification failed: ${error.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`🔍 [WEBHOOK] Processing checkout.session.completed for session ${session.id}`)

        // Check if this is a test order
        const isTestOrder = session.metadata?.is_test_order === "true"

        // Log the webhook event
        await logCheckoutEvent("webhook_received", {
          event_type: event.type,
          session_id: session.id,
          payment_status: session.payment_status,
          isTestOrder,
          isTestMode: STRIPE_TEST_MODE,
        })

        // Get the order number from metadata
        const orderNumber = session.metadata?.orderNumber || session.metadata?.order_number

        if (!orderNumber) {
          console.error("❌ [WEBHOOK] No order number found in session metadata")
          return NextResponse.json({ error: "No order number found" }, { status: 400 })
        }

        console.log(`🔍 [WEBHOOK] Found order number: ${orderNumber}`)

        // Update order status
        await updateOrderStatus(orderNumber, "paid")
        console.log(`✅ [WEBHOOK] Updated order status to paid for order ${orderNumber}`)

        // Fetch the order details
        const supabase = createClient()
        console.log(`🔍 [WEBHOOK] Fetching order details from database for order ${orderNumber}`)
        const { data: order, error } = await supabase
          .from("order_logs")
          .select("*")
          .eq("order_number", orderNumber)
          .single()

        if (error || !order) {
          console.error(`❌ [WEBHOOK] Error fetching order from database: ${error?.message || "Order not found"}`)
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        console.log(`✅ [WEBHOOK] Successfully retrieved order from database: ${order.order_number}`)

        try {
          // Convert DB order to OrderLogData
          console.log(`🔍 [WEBHOOK] Converting order data to app format`)
          const orderData = mapDbOrderToAppFormat(order)
          console.log(`✅ [WEBHOOK] Order data converted successfully`)

          // Send order confirmation email
          console.log(`🔍 [WEBHOOK] Sending order confirmation email to ${orderData.customerInfo.email}`)
          const emailResult = await sendOrderConfirmationEmail(orderData)

          if (emailResult.success) {
            console.log(`✅ [WEBHOOK] Order confirmation email sent successfully`)
          } else {
            console.error(`❌ [WEBHOOK] Failed to send order confirmation email:`, emailResult.error)
          }
        } catch (emailError) {
          console.error(`❌ [WEBHOOK] Exception during email sending:`, emailError)
        }

        // Log success
        await logCheckoutEvent("payment_successful", {
          session_id: session.id,
          customer_email: session.customer_details?.email,
          amount: session.amount_total,
          isTestOrder,
          isTestMode: STRIPE_TEST_MODE,
        })

        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`🔍 [WEBHOOK] Processing payment_intent.succeeded for intent ${paymentIntent.id}`)

        // Log the payment success
        await logCheckoutEvent("payment_intent_succeeded", {
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          isTestMode: STRIPE_TEST_MODE,
        })

        break

      default:
        // Log unhandled event type
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event.type}`)
        await logCheckoutEvent("unhandled_webhook_event", {
          event_type: event.type,
          isTestMode: STRIPE_TEST_MODE,
        })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ [WEBHOOK] Webhook error:", error)

    // Log the error
    await logCheckoutEvent("webhook_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      isTestMode: STRIPE_TEST_MODE,
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
