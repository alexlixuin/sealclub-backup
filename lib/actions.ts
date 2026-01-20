"use server"
import Stripe from "stripe"
import type { OrderData, AddressType, DiscountInfo } from "./types"
import { getNextOrderNumber, logOrder, logCheckoutEvent } from "./order-logger"
import { getSupabaseAdmin } from "./supabase"
import { STRIPE_TEST_MODE } from "./config"
import { calculateStripeCharges } from "./stripe-fees"
import { recordAffiliateTransaction } from "./affiliate-service"
import { getDiscountByCode, recordDiscountUsage } from "./discount-service"

// Stripe compliance utility functions
function getStripeCompliantProductName(originalName: string, orderNumber: number): string {
  const prefixes = [
    "Laboratory Training Manual - ",
    "Safety Guide Printed Physical PDF - ",
    "Chemical Reference Guide - ",
    "Research Consultation Service - "
  ]
  
  // Use order number as seed for consistent prefix selection within same order
  const prefixIndex = orderNumber % prefixes.length
  return prefixes[prefixIndex] + originalName
}

function getStripeCompliantDescription(): string {
  return "Educational research documentation"
}

const supabaseAdmin = getSupabaseAdmin()

// Get the appropriate Stripe keys based on mode
const isTestMode = STRIPE_TEST_MODE

// Get the appropriate Stripe keys based on mode
const stripeSecretKey = isTestMode ? process.env.STRIPE_TEST_KEY || "" : process.env.STRIPE_SECRET_KEY || ""

// Validate that we have a key
if (!stripeSecretKey) {
  throw new Error(`Stripe ${isTestMode ? "test" : "live"} key is not set. Please check your environment variables.`)
}

// Initialize Stripe with the appropriate key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil",
})

// Log the current Stripe mode and key (partially masked for security)
console.log(`Stripe initialized in ${isTestMode ? "TEST" : "LIVE"} mode`)
console.log(
  `Using Stripe key: ${stripeSecretKey.substring(0, 8)}...${stripeSecretKey.substring(stripeSecretKey.length - 4)}`,
)

// Helper function to validate address
function validateAddress(address: AddressType): string | null {
  if (!address.address || address.address.trim() === "") return "Address is required"
  if (!address.city || address.city.trim() === "") return "City is required"
  if (!address.state || address.state.trim() === "") return "State is required"
  if (!address.zipCode || address.zipCode.trim() === "") return "ZIP code is required"
  if (!address.country || address.country.trim() === "") return "Country is required"
  return null
}

export async function createMixedCheckoutSession(orderData: OrderData) {
  try {
    console.log("[v0] createMixedCheckoutSession: Starting mixed checkout process...")
    console.log("[v0] createMixedCheckoutSession: Received data:", JSON.stringify(orderData, null, 2))
    console.log("[v0] createMixedCheckoutSession: Shipping method:", orderData.shippingMethod)
    console.log("[v0] createMixedCheckoutSession: Shipping country:", orderData.customerInfo.shippingAddress.country)

    // Validate billing address
    const billingAddressError = validateAddress(orderData.customerInfo.billingAddress)
    if (billingAddressError) {
      return { error: `Billing address error: ${billingAddressError}` }
    }

    // Validate shipping address
    const shippingAddressError = validateAddress(orderData.customerInfo.shippingAddress)
    if (shippingAddressError) {
      return { error: `Shipping address error: ${shippingAddressError}` }
    }

    // Validate email
    if (!orderData.customerInfo.email || !orderData.customerInfo.email.includes("@")) {
      return { error: "Valid email address is required" }
    }

    // Validate phone
    if (!orderData.customerInfo.phone) {
      return { error: "Phone number is required" }
    }

    // Separate one-time and subscription items
    const oneTimeItems = orderData.items.filter(item => !item.isSubscription)
    const subscriptionItems = orderData.items.filter(item => item.isSubscription)

    console.log(`One-time items: ${oneTimeItems.length}, Subscription items: ${subscriptionItems.length}`)

    // Get the next order number
    const orderNumber = await getNextOrderNumber()
    console.log("[v0] createMixedCheckoutSession: Order number assigned:", orderNumber)

    // Check if this is a test product order OR if we're in test mode
    const isTestProductOrder = orderData.items.length === 1 && orderData.items[0].id === "test-product"
    const isTestOrder = isTestMode || isTestProductOrder

    // Calculate processing fee for one-time items only
    let processingFeeAmount = 0
    let adjustedTotal = orderData.total
    
    if (!isTestProductOrder && oneTimeItems.length > 0) {
      const oneTimeTotal = oneTimeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const feeCalculation = calculateStripeCharges(oneTimeTotal)
      processingFeeAmount = feeCalculation.processingFee
      adjustedTotal = orderData.total + processingFeeAmount
      
      orderData.processingFee = processingFeeAmount
      console.log(`Processing fee calculation: One-time total=${oneTimeTotal}, Fee=${processingFeeAmount}`)
    }

    // Create line items for one-time purchases
    const oneTimeLineItems = oneTimeItems.map((item) => {
      let imageUrl = item.image
      if (imageUrl.startsWith("/")) {
        imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ozptides.com"}${imageUrl}`
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [imageUrl],
            metadata: {
              id: item.id,
              order_number: orderNumber.toString(),
              item_type: "one_time",
            },
            description: "For research purposes only. Not for human consumption.",
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Create subscription line items
    const subscriptionLineItems = await Promise.all(
      subscriptionItems.map(async (item) => {
        const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ozptides.com"}/guide.png`

        // Create or retrieve a Stripe product for the subscription
        const productId = `sub_${item.id}_${item.sizeId || 'default'}`
        let stripeProduct
        
        try {
          stripeProduct = await stripe.products.retrieve(productId)
        } catch (error) {
          // Product doesn't exist, create it
          stripeProduct = await stripe.products.create({
            id: productId,
            name: getStripeCompliantProductName(`${item.name} - Subscription`, orderNumber),
            images: [imageUrl],
            metadata: {
              original_product_id: item.id,
              subscription: "true",
            },
            description: getStripeCompliantDescription(),
          })
        }

        // Create or retrieve a Stripe price for the subscription
        const priceLookupKey = `price_${productId}_monthly`
        let stripePrice
        
        try {
          // Try to find existing price by lookup key
          const prices = await stripe.prices.list({
            product: stripeProduct.id,
            lookup_keys: [priceLookupKey],
            limit: 1,
          })
          
          if (prices.data.length > 0) {
            stripePrice = prices.data[0]
          } else {
            throw new Error("Price not found")
          }
        } catch (error) {
          // Price doesn't exist, create it
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(item.price * 100),
            currency: "usd",
            recurring: {
              interval: item.subscriptionInterval || "month",
              interval_count: item.subscriptionIntervalCount || 1,
            },
            lookup_key: priceLookupKey,
            metadata: {
              order_number: orderNumber.toString(),
              item_type: "subscription",
            },
          })
        }

        return {
          price: stripePrice.id,
          quantity: item.quantity,
        }
      })
    )

    // Create the checkout session
    const sessionOptions: any = {
      payment_method_types: ["card"],
      line_items: [
        ...oneTimeLineItems,
        ...subscriptionLineItems,
        // Processing Fee line item (only for one-time items)
        ...(processingFeeAmount > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "Processing Fee",
                    metadata: {
                      id: "processing-fee",
                      order_number: orderNumber.toString(),
                      fee_type: "stripe_processing",
                    },
                    description: "Payment processing fee (3.5% + $0.30)",
                  },
                  unit_amount: Math.round(processingFeeAmount * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      mode: subscriptionItems.length > 0 ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      customer_email: orderData.customerInfo.email,
      billing_address_collection: "required",
      metadata: {
        order_number: orderNumber.toString(),
        test_mode: isTestOrder.toString(),
        has_subscriptions: subscriptionItems.length > 0 ? "true" : "false",
        one_time_items: oneTimeItems.length.toString(),
        subscription_items: subscriptionItems.length.toString(),
      },
    }

    // Only add shipping options for payment mode (one-time items only)
    if (!subscriptionItems.length) {
      sessionOptions.shipping_address_collection = {
        allowed_countries: isTestOrder ? ["CA"] : ["US", "CA", "GB", "AU"],
      }
      
      // Only add shipping options if we have a valid shipping method
      if (orderData.shippingMethod && orderData.shippingMethod.trim() !== "") {
        sessionOptions.shipping_options = [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round(orderData.shipping * 100),
                currency: "usd",
              },
              display_name: orderData.shippingMethod,
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: 5,
                },
                maximum: {
                  unit: "business_day",
                  value: 10,
                },
              },
            },
          },
        ]
      }
    } else {
      // For subscription mode, we need shipping address but no shipping options
      sessionOptions.shipping_address_collection = {
        allowed_countries: isTestOrder ? ["CA"] : ["US", "CA", "GB", "AU"],
      }
      // Add shipping as a separate line item for mixed carts
      if (orderData.shipping > 0) {
        sessionOptions.line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping",
              metadata: {
                id: "shipping-fee",
                order_number: orderNumber.toString(),
                shipping_method: orderData.shippingMethod || "Standard Shipping",
              },
              description: orderData.shippingMethod || "Standard Shipping",
            },
            unit_amount: Math.round(orderData.shipping * 100),
          },
          quantity: 1,
        })
      }
    }

    console.log("[v0] createMixedCheckoutSession: Creating Stripe checkout session...")
    const session = await stripe.checkout.sessions.create(sessionOptions)
    console.log("[v0] createMixedCheckoutSession: Stripe session created:", session.id)

    // Log the order to Supabase
    await logOrder({
      order_number: orderNumber,
      session_id: session.id,
      customer_email: orderData.customerInfo.email,
      customer_name: orderData.customerInfo.name,
      total_amount: orderData.total,
      items: orderData.items,
      howDidYouFindUs: orderData.howDidYouFindUs,
      shipping_info: {
        method: isTestProductOrder ? "No Shipping (Test Order)" : orderData.shippingMethod,
        address: orderData.customerInfo.shippingAddress,
      },
      billing_info: {
        address: orderData.customerInfo.billingAddress,
        phone: orderData.customerInfo.phone,
      },
      payment_status: "pending",
      is_test_order: isTestOrder,
      metadata: {
        is_test_mode: isTestMode,
        customer_phone: orderData.customerInfo.phone,
        has_subscriptions: subscriptionItems.length > 0,
        one_time_items: oneTimeItems.length,
        subscription_items: subscriptionItems.length,
      },
    })

    return { sessionId: session.id, orderNumber }
  } catch (error) {
    console.error("[v0] createMixedCheckoutSession: Error creating mixed checkout:", error)
    return { error: "Failed to create checkout session. Please try again." }
  }
}

export async function createBankTransferOrder(orderData: OrderData) {
  try {
    console.log("[v0] createBankTransferOrder: Starting bank transfer order creation...")
    console.log("[v0] createBankTransferOrder: Received data:", JSON.stringify(orderData, null, 2))

    // Validate billing address
    const billingAddressError = validateAddress(orderData.customerInfo.billingAddress)
    if (billingAddressError) {
      return { error: `Billing address error: ${billingAddressError}` }
    }

    // Validate shipping address
    const shippingAddressError = validateAddress(orderData.customerInfo.shippingAddress)
    if (shippingAddressError) {
      return { error: `Shipping address error: ${shippingAddressError}` }
    }

    // Validate email
    if (!orderData.customerInfo.email || !orderData.customerInfo.email.includes("@")) {
      return { error: "Valid email address is required" }
    }

    // Validate phone
    if (!orderData.customerInfo.phone) {
      return { error: "Phone number is required" }
    }

    // Get the next order number
    const orderNumber = await getNextOrderNumber()
    console.log("[v0] createBankTransferOrder: Order number assigned:", orderNumber)

    // Check if this is a test product order OR if we're in test mode
    const isTestProductOrder = orderData.items.length === 1 && orderData.items[0].id === "test-product"
    const isTestOrder = isTestMode || isTestProductOrder

    // Log the order to Supabase
    console.log("[v0] createBankTransferOrder: Logging order to database...")
    await logOrder({
      order_number: orderNumber,
      session_id: `bank_transfer_${orderNumber}_${Date.now()}`, // Generate unique session ID for bank transfer
      customer_email: orderData.customerInfo.email,
      customer_name: orderData.customerInfo.name,
      total_amount: orderData.total,
      items: [
        ...orderData.items,
        ...(orderData.protocolGuideSelected && orderData.protocolGuidePrice
          ? [{ id: "upsell-protocol-guide", name: "Protocol Guide", price: orderData.protocolGuidePrice, quantity: 1 }]
          : []),
        ...(orderData.nasalSpraySelected && orderData.nasalSprayPrice
          ? [{ id: "upsell-nasal-spray-form", name: "Nasal Spray Form", price: orderData.nasalSprayPrice, quantity: 1 }]
          : []),
      ],
      howDidYouFindUs: orderData.howDidYouFindUs,
      shipping_info: {
        method: isTestProductOrder ? "No Shipping (Test Order)" : orderData.shippingMethod,
        address: orderData.customerInfo.shippingAddress,
      },
      billing_info: {
        address: orderData.customerInfo.billingAddress,
        phone: orderData.customerInfo.phone,
      },
      payment_status: "pending_bank_transfer",
      is_test_order: isTestOrder,
      metadata: {
        is_test_mode: isTestMode,
        customer_phone: orderData.customerInfo.phone,
        payment_method: "bank_transfer",
        discount_code: orderData.discount?.code || "",
        discount_amount: orderData.discount ? orderData.discount.amountSaved.toString() : "0",
      },
    })
    console.log("[v0] createBankTransferOrder: Order logged successfully")

    // Record affiliate transaction if an affiliate code was used
    if (orderData.affiliate) {
      await recordAffiliateTransaction(
        orderData.affiliate.affiliateCodeId,
        orderData.affiliate.affiliateId,
        orderNumber.toString(),
        orderData.customerInfo.email,
        orderData.total,
        orderData.affiliate.commissionRate,
      )
    }

    // Record discount usage if a discount was applied
    if (orderData.discount) {
      const discount = await getDiscountByCode(orderData.discount.code)
      if (discount) {
        await recordDiscountUsage(
          discount.id,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.discount.amountSaved,
        )
      }
    }

    // Log the successful creation of the bank transfer order
    await logCheckoutEvent("bank_transfer_order_created", {
      orderNumber: orderNumber,
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      discount: orderData.discount,
      isTestOrder: isTestOrder,
      isTestMode: isTestMode,
      paymentMethod: "bank_transfer",
    })

    console.log("[v0] createBankTransferOrder: Bank transfer order creation completed successfully")
    console.log("[v0] createBankTransferOrder: Order Number:", orderNumber)

    return { orderNumber, success: true }
  } catch (error) {
    console.error("[v0] createBankTransferOrder: Error creating bank transfer order:", error)

    // Log the error
    await logCheckoutEvent("bank_transfer_order_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderData,
      isTestMode,
    })

    return { error: "Failed to create bank transfer order. Please try again." }
  }
}

export async function createTransakOrder(orderData: OrderData) {
  try {
    console.log("[v0] createTransakOrder: Starting Transak order creation...")
    console.log("[v0] createTransakOrder: Received data:", JSON.stringify(orderData, null, 2))

    // Validate billing address
    const billingAddressError = validateAddress(orderData.customerInfo.billingAddress)
    if (billingAddressError) {
      return { error: `Billing address error: ${billingAddressError}` }
    }

    // Validate shipping address
    const shippingAddressError = validateAddress(orderData.customerInfo.shippingAddress)
    if (shippingAddressError) {
      return { error: `Shipping address error: ${shippingAddressError}` }
    }

    // Validate email
    if (!orderData.customerInfo.email || !orderData.customerInfo.email.includes("@")) {
      return { error: "Valid email address is required" }
    }

    // Validate phone
    if (!orderData.customerInfo.phone) {
      return { error: "Phone number is required" }
    }

    // Get the next order number
    const orderNumber = await getNextOrderNumber()
    console.log("[v0] createTransakOrder: Order number assigned:", orderNumber)

    // Log the order to Supabase
    console.log("[v0] createTransakOrder: Logging order to database...")
    await logOrder({
      order_number: orderNumber,
      session_id: `transak_${orderNumber}_${Date.now()}`, // Generate unique session ID for Transak
      customer_email: orderData.customerInfo.email,
      customer_name: orderData.customerInfo.name,
      total_amount: orderData.total,
      items: [
        ...orderData.items,
        ...(orderData.protocolGuideSelected && orderData.protocolGuidePrice
          ? [{ id: "upsell-protocol-guide", name: "Protocol Guide", price: orderData.protocolGuidePrice, quantity: 1 }]
          : []),
        ...(orderData.nasalSpraySelected && orderData.nasalSprayPrice
          ? [{ id: "upsell-nasal-spray", name: "Nasal Spray Form", price: orderData.nasalSprayPrice, quantity: 1 }]
          : []),
      ],
      payment_method: orderData.paymentMethod || "transak",
      crypto_currency: orderData.cryptoCurrency,
      shipping_method: orderData.shippingMethod,
      shipping_cost: orderData.shipping,
      discount_info: orderData.discount,
      affiliate_info: orderData.affiliate,
      how_did_you_find_us: orderData.howDidYouFindUs,
      shipping_address: orderData.customerInfo.shippingAddress,
      billing_address: orderData.customerInfo.billingAddress,
      customer_phone: orderData.customerInfo.phone,
      status: "pending_payment",
      created_at: new Date().toISOString(),
    })

    console.log("[v0] createTransakOrder: Order logged successfully")

    // Record affiliate transaction if applicable
    if (orderData.affiliate) {
      try {
        await recordAffiliateTransaction(
          orderData.affiliate.affiliateCodeId,
          orderData.affiliate.affiliateId,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.total,
          orderData.affiliate.commissionRate
        )
        console.log("[v0] createTransakOrder: Affiliate transaction recorded")
      } catch (affiliateError) {
        console.error("[v0] createTransakOrder: Error recording affiliate transaction:", affiliateError)
        // Don't fail the order creation for affiliate errors
      }
    }

    return {
      success: true,
      orderNumber,
      message: "Transak order created successfully"
    }

  } catch (error) {
    console.error("[v0] createTransakOrder: Error creating Transak order:", error)
    return { 
      error: error instanceof Error ? error.message : "Failed to create order. Please try again." 
    }
  }
}

export async function createOrder(orderData: OrderData) {
  try {
    console.log("[v0] createOrder: Starting order creation process...")
    console.log("[v0] createOrder: Received data:", JSON.stringify(orderData, null, 2))

    // Validate billing address
    const billingAddressError = validateAddress(orderData.customerInfo.billingAddress)
    if (billingAddressError) {
      return { error: `Billing address error: ${billingAddressError}` }
    }

    // Validate shipping address
    const shippingAddressError = validateAddress(orderData.customerInfo.shippingAddress)
    if (shippingAddressError) {
      return { error: `Shipping address error: ${shippingAddressError}` }
    }

    // Validate email
    if (!orderData.customerInfo.email || !orderData.customerInfo.email.includes("@")) {
      return { error: "Valid email address is required" }
    }

    // Validate phone
    if (!orderData.customerInfo.phone) {
      return { error: "Phone number is required" }
    }

    // Log the start of the checkout process
    console.log("[v0] createOrder: Logging checkout started event...")
    await logCheckoutEvent("checkout_started", {
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      customerName: orderData.customerInfo.name,
      items: orderData.items,
      total: orderData.total,
      discount: orderData.discount,
      isTestMode,
    })

    // Get the next order number
    console.log("[v0] createOrder: Getting next order number...")
    const orderNumber = await getNextOrderNumber()
    console.log("[v0] createOrder: Order number assigned:", orderNumber)

    // Check if this is a test product order OR if we're in test mode
    const isTestProductOrder = orderData.items.length === 1 && orderData.items[0].id === "test-product"
    const isTestOrder = isTestMode || isTestProductOrder

    // If it's a test product order (not just test mode), adjust the pricing
    if (isTestProductOrder) {
      // Set shipping to 0 for test product orders
      orderData.shipping = 0
      orderData.total = 1.0 // Ensure total is exactly $1.00
    }

    // Calculate processing fee (3.5% + $0.30 for all cards)
    // Customer pays Stripe fees instead of merchant
    let processingFeeAmount = 0
    let adjustedTotal = orderData.total
    
    if (!isTestProductOrder) {
      const feeCalculation = calculateStripeCharges(orderData.total)
      processingFeeAmount = feeCalculation.processingFee
      adjustedTotal = feeCalculation.grossAmount
      
      // Add processing fee to order data for UI display
      orderData.processingFee = processingFeeAmount
      
      console.log('Processing fee calculation: Net=' + orderData.total + ', Fee=' + processingFeeAmount + ', Gross=' + (orderData.total + processingFeeAmount))
    }

    // Server-side eligibility check for Next Day Delivery
    const nextDayEligibleProducts = [
      'retatrutide',
      'tirzepatide', 
      'semaglutide',
      'cjc-1295',
      'ipamorelin',
      'hgh-191aa',
      'igf-1lr3',
      'selank',
      'semax',
      'bacteriostatic-water',
      'bacteriostatic-water-10ml'
    ];
    
    const hasEligibleProducts = orderData.items.some(item => nextDayEligibleProducts.includes(item.id));
    const isAustralia = orderData.customerInfo.shippingAddress.country === 'AU';
    const isNextDaySelected = orderData.shippingMethod === 'Next Day Delivery (Melbourne ONLY)';
    
    console.log('=== SERVER-SIDE ELIGIBILITY CHECK ===');
    console.log('Order items:', orderData.items.map(item => item.id));
    console.log('Has eligible products:', hasEligibleProducts);
    console.log('Is Australia:', isAustralia);
    console.log('Next Day selected:', isNextDaySelected);
    console.log('Selected shipping method:', orderData.shippingMethod);
    
    // Validate shipping method selection
    if (isNextDaySelected) {
      if (!isAustralia || !hasEligibleProducts) {
        console.log('Next Day selected but not eligible, falling back to Standard Shipping');
        orderData.shippingMethod = 'Standard Shipping (Oceania ONLY)';
        orderData.shipping = 25; // Update shipping cost
        orderData.total = orderData.subtotal + orderData.shipping + (orderData.protocolGuideSelected ? (orderData.protocolGuidePrice || 0) : 0) + (orderData.nasalSpraySelected ? (orderData.nasalSprayPrice || 0) : 0);
      } else {
        console.log('Next Day Delivery validated and confirmed');
        // Ensure correct Next Day pricing
        orderData.shipping = 45;
        orderData.total = orderData.subtotal + orderData.shipping + (orderData.protocolGuideSelected ? (orderData.protocolGuidePrice || 0) : 0) + (orderData.nasalSpraySelected ? (orderData.nasalSprayPrice || 0) : 0);
      }
    } else if (orderData.shippingMethod === 'Standard Shipping (Oceania ONLY)') {
      // Validate Standard Shipping for Oceania countries
      const oceaniaCountries = ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'TO', 'TV', 'NR', 'KI', 'PW', 'MH', 'FM'];
      const isOceania = oceaniaCountries.includes(orderData.customerInfo.shippingAddress.country);
      if (!isOceania) {
        console.log('Standard Oceania shipping selected for non-Oceania country, switching to International');
        orderData.shippingMethod = 'Express International (Worldwide Dispatch)';
        orderData.shipping = 45.99;
        orderData.total = orderData.subtotal + orderData.shipping + (orderData.protocolGuideSelected ? (orderData.protocolGuidePrice || 0) : 0) + (orderData.nasalSpraySelected ? (orderData.nasalSprayPrice || 0) : 0);
      } else {
        console.log('Standard Oceania shipping validated');
      }
    } else if (orderData.shippingMethod === 'Express International (Worldwide Dispatch)') {
      console.log('International shipping validated');
    }
    console.log('Final shipping method after validation:', orderData.shippingMethod);
    console.log('=====================================');

    console.log('Creating order with order number:', orderNumber)
    console.log('Order data:', orderData)
    // Create a Stripe checkout session
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        // Base cart items
        ...orderData.items.map((item) => {
          // Validate item price before processing
          if (typeof item.price !== "number" || item.price < 0) {
            console.error(`Invalid price for item: ${item.name}. Price: ${item.price}`)
            throw new Error(`Invalid price for item: ${item.name}. Please check product data.`)
          }

          // Use guide.png for all Stripe product images for compliance
          const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ozptides.com"}/guide.png`

          // Log debug information
          console.log(`Processing item: ${item.id}, Image URL: ${imageUrl}`)

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: getStripeCompliantProductName(item.name, orderNumber),
                images: [imageUrl],
                metadata: {
                  id: item.id,
                  order_number: orderNumber.toString(),
                  original_name: item.name, // Store original name in metadata
                },
                description: getStripeCompliantDescription(),
              },
              unit_amount: Math.round(item.price * 100), // Stripe requires amounts in cents
            },
            quantity: item.quantity,
          }
        }),
        // Protocol Guide upsell as a separate non-discountable line item
        ...(orderData.protocolGuideSelected && orderData.protocolGuidePrice
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: getStripeCompliantProductName("Protocol Guide", orderNumber),
                    images: [
                      `${process.env.NEXT_PUBLIC_BASE_URL || "https://ozptides.com"}/guide.png`,
                    ],
                    metadata: {
                      id: "upsell-protocol-guide",
                      order_number: orderNumber.toString(),
                      upsell: "true",
                      original_name: "Protocol Guide",
                    },
                    description: getStripeCompliantDescription(),
                  },
                  unit_amount: Math.round(orderData.protocolGuidePrice * 100),
                },
                quantity: 1,
              },
            ]
          : []),
        // Nasal Spray Form upsell as a separate non-discountable line item
        ...(orderData.nasalSpraySelected && orderData.nasalSprayPrice
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: getStripeCompliantProductName("Nasal Spray Form", orderNumber),
                    images: [
                      `${process.env.NEXT_PUBLIC_BASE_URL || "https://ozptides.com"}/guide.png`,
                    ],
                    metadata: {
                      id: "upsell-nasal-spray-form",
                      order_number: orderNumber.toString(),
                      upsell: "true",
                      original_name: "Nasal Spray Form",
                    },
                    description: getStripeCompliantDescription(),
                  },
                  unit_amount: Math.round(orderData.nasalSprayPrice * 100),
                },
                quantity: 1,
              },
            ]
          : []),
        // Processing Fee line item (customer pays Stripe fees)
        ...(processingFeeAmount > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "Processing Fee",
                    metadata: {
                      id: "processing-fee",
                      order_number: orderNumber.toString(),
                      fee_type: "stripe_processing",
                    },
                    description: "Payment processing fee (3.5% + $0.30)",
                  },
                  unit_amount: Math.round(processingFeeAmount * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      mode: "payment",
      customer_email: orderData.customerInfo.email,
      billing_address_collection: "required",
      metadata: {
        customer_name: orderData.customerInfo.name,
        customer_phone: orderData.customerInfo.phone,
        order_number: orderNumber.toString(),
        is_test_order: isTestOrder ? "true" : "false",
        is_test_mode: isTestMode ? "true" : "false",
        discount_code: orderData.discount?.code || "",
        discount_amount: orderData.discount ? orderData.discount.amountSaved.toString() : "0",
        affiliate_id: orderData.affiliate?.affiliateId || "",
        affiliate_commission: orderData.affiliate
          ? (orderData.total * orderData.affiliate.commissionRate).toString()
          : "0",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/cancel`,
    }

    // Add discount information if available
    if (orderData.discount || orderData.affiliate) {
      sessionOptions.discounts = []

      if (orderData.discount) {
        sessionOptions.discounts.push({
          coupon: await createOrRetrieveStripeCoupon(orderData.discount),
        })
      }

      if (orderData.affiliate) {
        const affiliateDiscount: DiscountInfo = {
          code: orderData.affiliate.code, // Use the human-readable code
          type: "percentage",
          value: orderData.affiliate.discountPercentage, // Use the customer discount percentage
          amountSaved: orderData.affiliate.amountSaved, // Use the pre-calculated amount saved
        }
        sessionOptions.discounts.push({
          coupon: await createOrRetrieveStripeCoupon(affiliateDiscount),
        })
      }
    }

    // Only add shipping options for non-test-product orders and valid shipping methods
    if (!isTestProductOrder && orderData.shippingMethod && orderData.shippingMethod.trim() !== "") {
      sessionOptions.shipping_options = [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(orderData.shipping * 100),
              currency: "usd",
            },
            display_name: orderData.shippingMethod,
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: orderData.shippingMethod.includes("Next Day") ? 1 : 
                       orderData.shippingMethod.includes("Express") ? 1 : 2,
              },
              maximum: {
                unit: "business_day",
                value: orderData.shippingMethod.includes("Next Day") ? 1 : 
                       orderData.shippingMethod.includes("Express") ? 2 : 4,
              },
            },
          },
        },
      ]
      sessionOptions.shipping_address_collection = {
        allowed_countries: [
          // North America
          "US",
          "CA",
          "MX",
          // Europe
          "GB",
          "DE",
          "FR",
          "IT",
          "ES",
          "NL",
          "BE",
          "AT",
          "CH",
          "SE",
          "NO",
          "DK",
          "FI",
          "IE",
          "PT",
          "PL",
          "CZ",
          "HU",
          "GR",
          "RO",
          "BG",
          "HR",
          "SI",
          "SK",
          "LT",
          "LV",
          "EE",
          "LU",
          "MT",
          "CY",
          // Asia Pacific
          "AU",
          "NZ",
          "JP",
          "KR",
          "SG",
          "HK",
          "TW",
          "MY",
          "TH",
          "PH",
          "ID",
          "VN",
          "IN",
          "CN",
          // Middle East
          "AE",
          "SA",
          "IL",
          "TR",
          "QA",
          "KW",
          "BH",
          "OM",
          "JO",
          "LB",
          // South America
          "BR",
          "AR",
          "CL",
          "CO",
          "PE",
          "UY",
          "EC",
          "VE",
          "BO",
          "PY",
          // Africa
          "ZA",
          "EG",
          "MA",
          "NG",
          "KE",
          "GH",
          "TN",
          "DZ",
          "UG",
          "TZ",
          // Other
          "RU",
          "UA",
          "BY",
          "MD",
          "GE",
          "AM",
          "AZ",
          "KZ",
          "UZ",
          "KG",
          "TJ",
          "TM",
        ],
      }
    }

    console.log("[v0] createOrder: Creating Stripe checkout session...")
    const session = await stripe.checkout.sessions.create(sessionOptions)
    console.log("[v0] createOrder: Stripe session created:", session.id)

    // Log the order to Supabase
    console.log("[v0] createOrder: Logging order to database...")
    await logOrder({
      order_number: orderNumber,
      session_id: session.id,
      customer_email: orderData.customerInfo.email,
      customer_name: orderData.customerInfo.name,
      total_amount: orderData.total,
      items: [
        ...orderData.items,
        ...(orderData.protocolGuideSelected && orderData.protocolGuidePrice
          ? [{ id: "upsell-protocol-guide", name: "Protocol Guide", price: orderData.protocolGuidePrice, quantity: 1 }]
          : []),
        ...(orderData.nasalSpraySelected && orderData.nasalSprayPrice
          ? [{ id: "upsell-nasal-spray-form", name: "Nasal Spray Form", price: orderData.nasalSprayPrice, quantity: 1 }]
          : []),
      ],
      howDidYouFindUs: orderData.howDidYouFindUs,
      shipping_info: {
        method: isTestProductOrder ? "No Shipping (Test Order)" : orderData.shippingMethod,
        address: orderData.customerInfo.shippingAddress,
      },
      billing_info: {
        address: orderData.customerInfo.billingAddress,
        phone: orderData.customerInfo.phone, // Add phone to billing_info
      },
      payment_status: "pending",
      is_test_order: isTestOrder, // Use the corrected isTestOrder logic
      metadata: {
        is_test_mode: isTestMode,
        customer_phone: orderData.customerInfo.phone, // Also add phone to metadata for redundancy
        discount_code: orderData.discount?.code || "",
        discount_amount: orderData.discount ? orderData.discount.amountSaved.toString() : "0",
      },
    })
    console.log("[v0] createOrder: Order logged successfully")

    // Record affiliate transaction if an affiliate code was used
    if (orderData.affiliate) {
      await recordAffiliateTransaction(
        orderData.affiliate.affiliateCodeId,
        orderData.affiliate.affiliateId,
        orderNumber.toString(),
        orderData.customerInfo.email,
        orderData.total,
        orderData.affiliate.commissionRate,
      )
    }

    // Record discount usage if a discount was applied
    if (orderData.discount) {
      const discount = await getDiscountByCode(orderData.discount.code)
      if (discount) {
        await recordDiscountUsage(
          discount.id,
          orderNumber.toString(),
          orderData.customerInfo.email,
          orderData.discount.amountSaved,
        )
      }
    }

    // Log the successful creation of the checkout session
    await logCheckoutEvent("checkout_session_created", {
      sessionId: session.id,
      orderNumber: orderNumber,
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      discount: orderData.discount,
      isTestOrder: isTestOrder,
      isTestMode: isTestMode,
    })

    console.log("[v0] createOrder: Order creation completed successfully")
    console.log("[v0] createOrder: Session ID:", session.id, "Order Number:", orderNumber)

    return { sessionId: session.id, orderNumber }
  } catch (error) {
    console.error("[v0] createOrder: Error creating order:", error)

    // Log the error
    await logCheckoutEvent("checkout_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderData,
      isTestMode,
    })

    return { error: "Failed to create order. Please try again." }
  }
}

// Helper function to create or retrieve a Stripe coupon
async function createOrRetrieveStripeCoupon(discount: DiscountInfo): Promise<string> {
  try {
    // Create a unique ID for the coupon based on the discount code
    const couponId = `COUPON_${discount.code.replace(/[^A-Z0-9]/gi, "_").toUpperCase()}`

    try {
      // Try to retrieve the coupon first
      const existingCoupon = await stripe.coupons.retrieve(couponId)
      return existingCoupon.id
    } catch (error) {
      // If the coupon doesn't exist, create a new one
      const couponData: Stripe.CouponCreateParams = {
        id: couponId,
        name: `Discount: ${discount.code}`,
        metadata: {
          code: discount.code,
          type: discount.type,
          value: discount.value.toString(),
        },
      }

      if (discount.type === "percentage") {
        couponData.percent_off = discount.value
      } else {
        couponData.amount_off = Math.round(discount.value * 100) // Convert to cents
        couponData.currency = "usd"
      }

      const newCoupon = await stripe.coupons.create(couponData)
      return newCoupon.id
    }
  } catch (error) {
    console.error("Error creating/retrieving Stripe coupon:", error)
    // If there's an error, return a dummy coupon ID that will be ignored
    return "DUMMY_COUPON"
  }
}

export async function getOrderBySessionId(sessionId: string) {
  try {
    // Skip Stripe for PayPal orders
    if (sessionId.startsWith("paypal_")) {
      console.log("PayPal session detected, skipping Stripe retrieval")
      return null
    }

    // Log the request to retrieve order
    await logCheckoutEvent("retrieve_order_request", {
      sessionId,
      isTestMode,
    })

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer", "shipping_cost.shipping_rate", "total_details.breakdown"],
    })

    // Extract the order number from metadata
    const orderNumber = session.metadata?.order_number
    const isTestOrder = session.metadata?.is_test_order === "true"
    const customerPhone = session.metadata?.customer_phone || ""
    const discountCode = session.metadata?.discount_code || ""
    const discountAmount = session.metadata?.discount_amount ? Number.parseFloat(session.metadata.discount_amount) : 0

    console.log("Retrieved session for order number:", orderNumber)
    console.log("Session data:", JSON.stringify(session, null, 2))
    console.log("Is test order:", isTestOrder)
    console.log("Stripe mode:", isTestMode ? "TEST" : "LIVE")

    // Fix: Properly access shipping details from the Stripe session
    const orderData = {
      id: session.id,
      orderNumber: orderNumber || "Unknown",
      customer: {
        email: session.customer_details?.email || "",
        name: session.customer_details?.name || "",
        phone: customerPhone,
      },
      items: session.line_items?.data.map((item) => ({
        id: item.price?.product.toString() || "",
        name: item.description || "",
        price: (item.price?.unit_amount || 0) / 100,
        quantity: item.quantity || 0,
      })),
      shipping: {
        address: {
          line1: session.customer_details?.address?.line1 || "",
          line2: session.customer_details?.address?.line2 || "",
          city: session.customer_details?.address?.city || "",
          state: session.customer_details?.address?.state || "",
          postalCode: session.customer_details?.address?.postal_code || "",
          country: session.customer_details?.address?.country || "",
        },
        name: session.customer_details?.name || "",
        carrier: isTestOrder
          ? "No Shipping (Test Order)"
          : typeof session.shipping_cost?.shipping_rate === "object"
            ? session.shipping_cost?.shipping_rate?.display_name || ""
            : "",
      },
      amount: {
        subtotal: (session.amount_subtotal || 0) / 100,
        shipping: isTestOrder ? 0 : (session.total_details?.amount_shipping || 0) / 100,
        discount: discountAmount,
        discountCode: discountCode,
        total: (session.amount_total || 0) / 100,
      },
      status: session.payment_status,
      date: new Date(session.created * 1000).toISOString(),
      isTestOrder: isTestOrder,
      isTestMode: isTestMode,
    }

    // Log the successful retrieval
    await logCheckoutEvent("retrieve_order_success", {
      sessionId,
      orderNumber,
      orderData,
      isTestOrder,
      isTestMode,
    })

    return orderData
  } catch (error) {
    console.error("Error retrieving order:", error)

    // Log the error
    await logCheckoutEvent("retrieve_order_error", {
      sessionId,
      error: error instanceof Error ? error.message : "Unknown error",
      isTestMode,
    })

    return null
  }
}

export async function updateOrderStatus(sessionId: string, status: string) {
  try {
    // Log the update request
    await logCheckoutEvent("update_order_status_request", {
      sessionId,
      status,
      isTestMode,
    })

    // Get the order from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const orderNumber = session.metadata?.order_number
    const isTestOrder = session.metadata?.is_test_order === "true"

    // Update the order status in Supabase
    const { error } = await supabaseAdmin
      .from("order_logs")
      .update({ payment_status: status })
      .eq("session_id", sessionId)

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    // Log the successful update
    await logCheckoutEvent("update_order_status_success", {
      sessionId,
      orderNumber,
      status,
      isTestOrder,
      isTestMode,
    })

    console.log(`Order status updated to ${status} for order number ${orderNumber}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)

    // Log the error
    await logCheckoutEvent("update_order_status_error", {
      sessionId,
      status,
      error: error instanceof Error ? error.message : "Unknown error",
      isTestMode,
    })

    return { error: "Failed to update order status." }
  }
}
