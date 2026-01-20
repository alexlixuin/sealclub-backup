// Shared PayPal config usable on both client and server
// Toggle this flag to switch between Sandbox and Live environments
export const PAYPAL_TEST_MODE = false

export function getPayPalClientId(): string {
  const id = PAYPAL_TEST_MODE
    ? process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_CLIENT_ID
    : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  if (!id) throw new Error("Missing PayPal Client ID for current mode")
  return id
}

// Helpful helper if needed in UI
export function getPayPalEnvironment(): "sandbox" | "live" {
  return PAYPAL_TEST_MODE ? "sandbox" : "live"
}
