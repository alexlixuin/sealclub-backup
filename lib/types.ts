import type { CartItem } from "@/components/cart-provider"

// Address type with optional properties
export type AddressType = {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export type DiscountInfo = {
  code: string
  type: "percentage" | "fixed"
  value: number
  amountSaved: number
}

export type AffiliateInfo = {
  affiliateId: string
  affiliateCodeId: string
  commissionRate: number
  code: string
  affiliateName: string
  discountPercentage: number
  amountSaved: number
}

export type OrderData = {
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  discount: DiscountInfo | null
  affiliate: AffiliateInfo | null
  shippingMethod: string
  howDidYouFindUs?: string
  userId?: string | null
  paymentMethod?: string
  cryptoCurrency?: string
  storeCreditUsed?: number
  // Upsells
  protocolGuideSelected?: boolean
  protocolGuidePrice?: number
  nasalSpraySelected?: boolean
  nasalSprayPrice?: number
  // Processing fee
  processingFee?: number
  // Additional metadata for payment details
  metadata?: Record<string, any>
  customerInfo: {
    email: string
    phone: string
    name: string
    billingAddress: AddressType
    shippingAddress: AddressType
  }
}

// Order related types
export type OrderLogData = {
  id?: string | number
  orderNumber: string
  sessionId: string
  howDidYouFindUs?: string
  storeCreditUsed?: number
  customerInfo: {
    email: string
    name: string
    phone?: string // Added phone to customerInfo
    // Store pre-formatted address strings
    shippingAddressString: string
    billingAddressString: string
    shippingAddress?: AddressType
    billingAddress?: AddressType
  }
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  shippingMethod: string
  status?: string
  paymentStatus?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, any>
  is_test_order?: boolean
  // Raw data for direct access
  rawBillingInfo?: any
  rawShippingInfo?: any
}

// Database field mapping
export type OrderLogDbData = {
  order_number: string | number
  session_id: string
  customer_email: string
  customer_name: string
  total_amount: number
  items: CartItem[]
  shipping_info: any
  billing_info: any // This will now include phone
  payment_status: string
  how_did_you_find_us?: string
  store_credit_used?: number
  is_test_order?: boolean
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Shipping related types
export type ShippingUpdateData = {
  trackingCode: string
  carrier: string
  orderNumber: string
  estimatedDelivery?: string
}

// Email related types
export type EmailResult = {
  success: boolean
  data?: any
  error?: any
}

// Webhook related types
export type WebhookEventData = {
  id: string
  type: string
  data: any
}

export type SizeOption = {
  id: string
  name: string
  price: number
  inStock?: boolean
  instockDomestic?: boolean
  instockInternational?: boolean
  sizeInfo?: string // New field to explain size codes
}

export type SubscriptionOption = {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  intervalCount: number
  description?: string
}

export type Product = {
  id: string
  name: string
  category: string
  // Replace single categorySlug with an array of category slugs
  categorySlug: string // Kept for backward compatibility
  categoryIds: string[] // New field for multiple categories
  description: string
  price: number // Base price (lowest price option)
  sizeOptions?: SizeOption[] // New field for size options
  subscriptionOptions?: SubscriptionOption[] // New field for subscription options
  image: string
  quantity: string
  chemicalName?: string
  casNumber?: string
  concentration?: string
  featured?: boolean
  new?: boolean
  bestSeller?: boolean
  purity?: string
  storage?: string
  halfLife?: string
  molecularFormula?: string
  molecularWeight?: string
  relatedProducts?: string[]
  sizeInfo?: string // New field to explain size codes for products
}

export type FormErrors = {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZipCode?: string
  shippingCountry?: string
  billingAddress?: string
  billingCity?: string
  billingState?: string
  billingZipCode?: string
  billingCountry?: string
  howDidYouFindUs?: string
}

export interface Review {
  id: string
  author: string
  avatar?: string
  rating: number
  date: string
  title: string
  content: string
  verified: boolean
}
