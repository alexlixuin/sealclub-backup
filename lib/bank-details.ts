import fs from 'fs'
import path from 'path'

export interface BankDetails {
  currency: string
  bankName: string
  accountHolder: string
  accountNumber: string
  swiftCode: string
  iban?: string
  routingNumber?: string
  bsb?: string
  sortCode?: string
  institutionNumber?: string
  transitNumber?: string
  address: string
}

export const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' }
]

// Static conversion rates (should be replaced with real-time rates in production)
export const currencyRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.75,
  CAD: 1.25,
  NZD: 1.45
}

export function parseBankDetails(): Record<string, BankDetails> {
  try {
    const filePath = path.join(process.cwd(), 'bank_details.txt')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))
    
    const bankDetails: Record<string, BankDetails> = {}
    
    lines.forEach(line => {
      const parts = line.split('|')
      if (parts.length >= 10) {
        const [currency, bankName, accountHolder, accountNumber, swiftCode, iban, routingNumber, bsb, sortCode, address] = parts
        
        bankDetails[currency] = {
          currency,
          bankName,
          accountHolder,
          accountNumber,
          swiftCode,
          iban: iban || undefined,
          routingNumber: routingNumber || undefined,
          bsb: bsb || undefined,
          sortCode: sortCode || undefined,
          address
        }
      }
    })
    
    return bankDetails
  } catch (error) {
    console.error('Error parsing bank details:', error)
    return {}
  }
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount
  
  const fromRate = currencyRates[fromCurrency] || 1
  const toRate = currencyRates[toCurrency] || 1
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}
