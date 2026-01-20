import Stripe from "stripe"
import { STRIPE_TEST_MODE } from "@/lib/config"

// Get the appropriate Stripe keys based on mode
export const stripeSecretKey = STRIPE_TEST_MODE
  ? process.env.STRIPE_TEST_KEY || ""
  : process.env.STRIPE_SECRET_KEY || ""

// Validate that we have a key
if (!stripeSecretKey) {
  throw new Error(
    `Stripe ${STRIPE_TEST_MODE ? "test" : "live"} key is not set. Please check your environment variables.`,
  )
}

// Get the appropriate webhook secret based on mode
export const webhookSecret = STRIPE_TEST_MODE
  ? process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ""
  : process.env.STRIPE_WEBHOOK_SECRET || ""

// Validate that we have a webhook secret
if (!webhookSecret) {
  throw new Error(
    `Stripe ${STRIPE_TEST_MODE ? "test" : "live"} webhook secret is not set. Please check your environment variables.`,
  )
}

// Initialize Stripe with the appropriate key
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil",
})

// Log the current Stripe mode
console.log(`Stripe service initialized in ${STRIPE_TEST_MODE ? "TEST" : "LIVE"} mode`)
console.log(
  `Using Stripe key: ${stripeSecretKey.substring(0, 8)}...${stripeSecretKey.substring(stripeSecretKey.length - 4)}`,
)

/**
 * Verifies a Stripe webhook signature
 * @param body The raw request body
 * @param signature The Stripe signature from the request headers
 * @returns The verified Stripe event
 */
export async function verifyWebhookSignature(body: string, signature: string): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error(`Webhook signature verification failed: ${error.message}`)
    throw err
  }
}

/**
 * Creates a checkout session
 * @param params The checkout session parameters
 * @returns The created checkout session
 */
export async function createCheckoutSession(
  params: Stripe.Checkout.SessionCreateParams,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create(params)
}

/**
 * Retrieves a checkout session
 * @param sessionId The session ID to retrieve
 * @returns The checkout session
 */
export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId)
}
