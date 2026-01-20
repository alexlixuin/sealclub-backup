// Simplified Stripe fee calculation utilities
// Fixed rate: 3.5% + $0.30 for all cards (domestic and international)

export interface StripeFeeConfig {
  rate: number // 0.035 for 3.5%
  fixedFee: number // 0.30 in USD
}

export const STRIPE_FEES: StripeFeeConfig = {
  rate: 0.035, // 3.5%
  fixedFee: 0.30, // $0.30
}

/**
 * Calculate the gross amount needed to receive the desired net amount after Stripe fees
 * Formula: Gross = (Net + FixedFee) / (1 - PercentageFee)
 */
export function calculateGrossAmount(netAmount: number): number {
  const gross = (netAmount + STRIPE_FEES.fixedFee) / (1 - STRIPE_FEES.rate)
  return Math.round(gross * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate the processing fee amount that will be charged to the customer
 */
export function calculateProcessingFee(netAmount: number): number {
  const grossAmount = calculateGrossAmount(netAmount)
  return Math.round((grossAmount - netAmount) * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate both gross amount and processing fee
 */
export function calculateStripeCharges(netAmount: number) {
  const grossAmount = calculateGrossAmount(netAmount)
  const processingFee = grossAmount - netAmount
  
  return {
    netAmount,
    grossAmount,
    processingFee: Math.round(processingFee * 100) / 100,
    feeRate: STRIPE_FEES.rate,
  }
}
