/**
 * Application configuration
 */

import { NewFactorListInstance } from "twilio/lib/rest/verify/v2/service/entity/newFactor"

// Set to true for test mode, false for live mode
export const STRIPE_TEST_MODE = false

export const STRIPE_PUBLISHABLE_KEY = STRIPE_TEST_MODE
  ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY!
  : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

// Payment configuration - Set to true to disable Stripe payments
export const STRIPE_PAYMENTS_DISABLED = true
export const STRIPE_PAYMENTS_ENABLED = !STRIPE_PAYMENTS_DISABLED

// Bank payments configuration - Set to false to disable international bank payments
export const BANK_PAYMENTS_ENABLED = false
export const BANK_PAYMENTS_DISABLED = !BANK_PAYMENTS_ENABLED

// Other configuration options can be added here
export const APP_NAME = "SealClub Beauty"
export const COMPANY_NAME = "SealClub Beauty"
export const SUPPORT_EMAIL = "support@sealclubbeauty.com"
export const EMAIL_DOMAIN = "sealclubbeauty.com" // Ensure this is set
