"use client"

import type React from "react"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart, type CartItem } from "@/components/cart-provider" // Fixed import path for useCart hook from correct location
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { createOrder, createMixedCheckoutSession, createTransakOrder, createBankTransferOrder } from "@/lib/actions"
import type { OrderData } from "@/lib/types"
import { calculateProcessingFee } from "@/lib/stripe-fees"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { CheckoutShippingNotification } from "@/components/checkout-shipping-notification"
import { PayPalCheckout } from "@/components/paypal-buttons"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { getPayPalClientId, PAYPAL_TEST_MODE } from "@/lib/paypal-config"
import { Copy, CreditCard, Banknote, Coins, CheckCircle, User, AlertCircle, MessageCircle, Info, MapPin } from "lucide-react"
// Removed PayPal SDK imports - using direct API approach instead
import { CheckoutDebugButton } from "@/components/checkout-debug-button"
import { USAShippingNotice } from "@/components/usa-shipping-notice"
import { createClientSafe } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { COUNTRIES, OCEANIA_COUNTRIES } from "@/lib/countries"
import { BankDetails } from "@/lib/bank-details"
import { STRIPE_TEST_MODE, STRIPE_PUBLISHABLE_KEY, STRIPE_PAYMENTS_ENABLED, BANK_PAYMENTS_ENABLED } from "@/lib/config"
import { loadStripe } from "@stripe/stripe-js"
import { CookieConsentModal } from "@/components/cookie-consent-modal"
import { useCookieDetection } from "@/hooks/use-cookie-detection"
import { Building2, Globe } from "lucide-react"

const stripePromise = STRIPE_PAYMENTS_ENABLED ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null

// PayPal configuration - direct API approach
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.paypal.com'
  : 'https://www.sandbox.paypal.com'

interface FormErrors {
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
  paymentMethod?: string
}

// PayPal Direct Payment Component (no SDK)
function PayPalDirectPayment({ 
  finalTotal, 
  items, 
  formData, 
  shippingCost, 
  subtotal, 
  shippingMethod, 
  affiliate, 
  setIsSubmitting, 
  clearCart, 
  toast 
}: {
  finalTotal: number
  items: any[]
  formData: any
  shippingCost: number
  subtotal: number
  shippingMethod: any
  affiliate: any
  setIsSubmitting: (value: boolean) => void
  clearCart: () => void
  toast: any
}) {
  const [isProcessing, setIsProcessing] = useState(false)

  // This component is deprecated - using PayPalCheckout instead
  return null
}

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    total,
    shippingCost,
    discount,
    affiliate,
    clearCart,
    protocolGuideSelected,
    setProtocolGuideSelected,
    protocolGuidePrice,
    nasalSpraySelected,
    nasalSprayPrice,
    shippingMethod,
    setShippingMethod,
    checkNextDayEligibility,
    updateShippingMethodByCountry,
    getAvailableShippingMethods,
    hasNextDayEligibleProducts,
    hasSubscriptionItems,
    oneTimeItems,
    subscriptionItems,
    useStoreCredit,
    setUseStoreCredit,
    availableStoreCredit,
    setAvailableStoreCredit,
    storeCreditUsed,
    setStoreCreditUsed,
  } = useCart()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>("")
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>("")

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
    shippingCountry: "",
    sameAsBilling: true,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingCountry: "",
    howDidYouFindUs: "",
    paymentMethod: STRIPE_PAYMENTS_ENABLED ? "stripe" : "bank-transfer",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({})
  const [validationDebug, setValidationDebug] = useState(false)
  
  // Cookie detection and consent modal
  const { thirdPartyCookiesEnabled, isChecking, requestStorageAccess } = useCookieDetection()
  const [showCookieModal, setShowCookieModal] = useState(false)
  const [lastValidation, setLastValidation] = useState<{ timestamp: number; errors: FormErrors; formData: any }>({
    timestamp: 0,
    errors: {},
    formData: {},
  })
  const [forceShowErrors, setForceShowErrors] = useState(false)

  // Bank transfer order state
  const [bankTransferOrderNumber, setBankTransferOrderNumber] = useState<string | null>(null)
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC")

  const [showShippingNotification, setShowShippingNotification] = useState(false)
  const [shippingNotificationData, setShippingNotificationData] = useState<{
    amountNeeded: number
    isOceania: boolean
    threshold: number
  } | null>(null)

  // Calculate processing fee (3.5% + $0.30 for cards, 5% for PayPal)
  const processingFee = useMemo(() => {
    // The cart `total` already has discounts, affiliate, and store credit applied
    const baseWithShipping = total + (formData.shippingCountry ? shippingCost : 0)

    if (formData.paymentMethod === 'paypal') {
      // 5% surcharge for PayPal payments
      return baseWithShipping * 0.05
    }
    return calculateProcessingFee(baseWithShipping)
  }, [total, formData.shippingCountry, shippingCost, formData.paymentMethod])

  const finalTotal = useMemo(() => {
    // Final = (cart total after discounts & store credit) + shipping + processing fees
    const baseWithShipping = total + (formData.shippingCountry ? shippingCost : 0)
    return baseWithShipping + processingFee
  }, [total, formData.shippingCountry, shippingCost, processingFee])

  const isOceaniaCountry = useCallback((countryCode: string) => {
    return OCEANIA_COUNTRIES.some((c) => c.value === countryCode)
  }, [])

  useEffect(() => {
    const savedData = localStorage.getItem("checkout-form-data")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        console.log("[v0] Restored form data from localStorage:", parsed)
        // If Stripe payments are disabled, force bank-transfer payment method
        if (!STRIPE_PAYMENTS_ENABLED && parsed.paymentMethod === "stripe") {
          parsed.paymentMethod = "bank-transfer"
        }
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("[v0] Failed to restore form data:", error)
      }
    }
  }, [])

  useEffect(() => {
    console.log("[v0] Form data changed:", formData)
    localStorage.setItem("checkout-form-data", JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (formData.firstName && formData.lastName) return

    const interval = window.setInterval(() => {
      setFormData((prev) => {
        if (prev.firstName && prev.lastName) return prev

        const firstNameEl = document.querySelector('input[name="firstName"]') as HTMLInputElement | null
        const lastNameEl = document.querySelector('input[name="lastName"]') as HTMLInputElement | null

        const nextFirstName = (firstNameEl?.value || "").trim() || prev.firstName
        const nextLastName = (lastNameEl?.value || "").trim() || prev.lastName

        if (nextFirstName === prev.firstName && nextLastName === prev.lastName) return prev

        return {
          ...prev,
          firstName: nextFirstName,
          lastName: nextLastName,
        }
      })
    }, 500)

    return () => window.clearInterval(interval)
  }, [formData.firstName, formData.lastName])

  // Enforce bank-transfer payment method when Stripe is disabled
  useEffect(() => {
    if (!STRIPE_PAYMENTS_ENABLED && formData.paymentMethod === "stripe") {
      setFormData(prev => ({ ...prev, paymentMethod: "bank-transfer" }))
    }
  }, [formData.paymentMethod])

  // Load user's store credit balance
  const loadUserStoreCredit = async (userId: string) => {
    try {
      console.log('[Store Credit] Loading balance for user:', userId)
      const supabase = createClientSafe()
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('store_credit')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Store Credit] Error loading store credit:', error)
        return
      }

      const balance = profile?.store_credit || 0
      console.log('[Store Credit] Loaded balance:', balance)
      setAvailableStoreCredit(balance)
    } catch (error) {
      console.error('[Store Credit] Error loading store credit:', error)
    }
  }

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, sameAsBilling: checked }))
    if (checked) {
      // Clear any billing field errors when billing is same as shipping
      setErrors((prev) => ({
        ...prev,
        billingAddress: undefined,
        billingCity: undefined,
        billingState: undefined,
        billingZipCode: undefined,
        billingCountry: undefined,
      }))
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const initAuth = async () => {
      try {
        const supabase = createClientSafe()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted && session?.user) {
          setUser(session.user)
          loadSavedAddresses(session.user.id)
          loadUserStoreCredit(session.user.id)
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return
          if (session?.user) {
            setUser(session.user)
            loadSavedAddresses(session.user.id)
            loadUserStoreCredit(session.user.id)
          } else {
            setUser(null)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth error:", error)
      }
    }

    initAuth()
    return () => {
      mounted = false
    }
  }, [])

  const collectFormDataFromDOM = useCallback(() => {
    console.log("[v0] Collecting form data directly from DOM elements...")
    const form = document.getElementById("checkout-form") as HTMLFormElement
    if (!form) {
      console.error("[v0] Form element not found")
      return null
    }

    const formDataFromDOM = new FormData(form)
    const collectedData: any = {}

    // Collect all form fields
    const fieldNames = [
      "email",
      "phone",
      "firstName",
      "lastName",
      "shippingAddress",
      "shippingCity",
      "shippingState",
      "shippingZipCode",
      "shippingCountry",
      "billingAddress",
      "billingCity",
      "billingState",
      "billingZipCode",
      "billingCountry",
      "howDidYouFindUs",
      "paymentMethod",
    ]

    fieldNames.forEach((fieldName) => {
      const value = (formDataFromDOM.get(fieldName) as string) || ""
      collectedData[fieldName] = value.trim()
      console.log(`[v0] DOM field ${fieldName}:`, `"${collectedData[fieldName]}"`)
    })

    // Handle checkbox separately
    const sameAsBillingCheckbox = form.querySelector('input[name="sameAsBilling"]') as HTMLInputElement
    collectedData.sameAsBilling = sameAsBillingCheckbox?.checked ?? true
    
    // Handle payment method radio buttons
    const paymentMethodRadio = form.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement
    collectedData.paymentMethod = paymentMethodRadio?.value || "stripe"

    console.log("[v0] Collected form data from DOM:", collectedData)
    return collectedData
  }, [])

  const validateFormData = useCallback((dataToValidate: any) => {
    console.log("[v0] Starting form validation with data:", dataToValidate)
    const newErrors: FormErrors = {}

    const requiredFields = [
      "email",
      "phone",
      "firstName",
      "lastName",
      "shippingAddress",
      "shippingCity",
      "shippingState",
      "shippingZipCode",
      "shippingCountry",
      "howDidYouFindUs",
    ] as const

    // Strategy 1: Basic required field validation
    for (const field of requiredFields) {
      const value = dataToValidate[field]

      if (!value || typeof value !== "string" || value.trim() === "") {
        newErrors[field] = "Required"
        console.log(`[v0] Field ${field} validation failed:`, value)
      } else {
        console.log(`[v0] Field ${field} is valid:`, `"${value}"`)
      }
    }

    // Strategy 2: Billing address validation (if not same as shipping)
    if (!dataToValidate.sameAsBilling) {
      const billingFields = [
        "billingAddress",
        "billingCity",
        "billingState",
        "billingZipCode",
        "billingCountry",
      ] as const

      for (const field of billingFields) {
        const value = dataToValidate[field]
        if (!value || typeof value !== "string" || value.trim() === "") {
          newErrors[field] = "Required"
          console.log(`[v0] Billing field ${field} validation failed:`, value)
        }
      }
    }

    // Strategy 3: Email format validation
    if (dataToValidate.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(dataToValidate.email.trim())) {
        newErrors.email = "Invalid email format"
        console.log(`[v0] Email validation failed:`, dataToValidate.email)
      }
    }

    const errorCount = Object.keys(newErrors).length
    console.log(`[v0] Validation complete. ${errorCount} errors found:`, newErrors)

    setErrors(newErrors)
    setLastValidation({ timestamp: Date.now(), errors: newErrors, formData: dataToValidate })
    return { isValid: errorCount === 0, errors: newErrors, errorCount }
  }, [])

  const validateFieldRealTime = useCallback(
    (fieldName: keyof FormErrors, value: string) => {
      console.log(`[v0] Real-time validating field ${fieldName}:`, `"${value}"`)

      // Clear error immediately if field becomes valid
      if (value && typeof value === "string" && value.trim() !== "") {
        if (fieldName === "email") {
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          if (isValidEmail && errors[fieldName]) {
            console.log(`[v0] Clearing email error - field is now valid`)
            setErrors((prev) => ({ ...prev, [fieldName]: undefined }))
          }
        } else if (errors[fieldName]) {
          console.log(`[v0] Clearing error for ${fieldName} - field is now valid`)
          setErrors((prev) => ({ ...prev, [fieldName]: undefined }))
        }
      }
    },
    [errors],
  )

  const copyToClipboard = async (text: string, type: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or when clipboard API is not available
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  const handleCryptoPaid = async () => {
    if (!bankTransferOrderNumber) {
      toast({
        title: "Order number required",
        description: "Please generate your order number first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Send email notification
      const response = await fetch('/api/crypto-payment-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: bankTransferOrderNumber,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          totalAmount: finalTotal,
        }),
      })

      if (response.ok) {
        // Open Crisp chat
        if (typeof window !== 'undefined' && (window as any).$crisp) {
          (window as any).$crisp.push(['do', 'chat:open'])
        }
        
        // Show modal
        setShowCryptoModal(true)
        
        toast({
          title: "Payment notification sent",
          description: "We've been notified of your crypto payment. Please wait for an agent to connect.",
        })
      } else {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending crypto payment notification:', error)
      toast({
        title: "Error sending notification",
        description: "Please contact support directly.",
        variant: "destructive",
      })
    }
  }

  const handleGetOrderNumber = async () => {
    setIsGeneratingOrder(true)
    
    try {
      // Use React state directly instead of DOM collection for better reliability
      const dataToUse = formData
      
      console.log("[v0] handleGetOrderNumber: Form data being validated:", dataToUse)
      
      const validation = validateFormData(dataToUse)
      
      console.log("[v0] handleGetOrderNumber: Validation result:", validation)
      
      if (!validation.isValid) {
        console.log("[v0] handleGetOrderNumber: Validation failed with errors:", validation.errors)
        toast({
          title: "Please complete all required fields",
          description: "Fill in all required information before generating your order number.",
          variant: "destructive",
        })
        setIsGeneratingOrder(false)
        return
      }

      // Prepare order data
      const orderData: OrderData = {
        items: [...items, ...subscriptionItems],
        customerInfo: {
          email: dataToUse.email,
          name: `${dataToUse.firstName} ${dataToUse.lastName}`,
          phone: dataToUse.phone,
          shippingAddress: {
            address: dataToUse.shippingAddress,
            city: dataToUse.shippingCity,
            state: dataToUse.shippingState,
            zipCode: dataToUse.shippingZipCode,
            country: dataToUse.shippingCountry,
          },
          billingAddress: dataToUse.sameAsBilling
            ? {
                address: dataToUse.shippingAddress,
                city: dataToUse.shippingCity,
                state: dataToUse.shippingState,
                zipCode: dataToUse.shippingZipCode,
                country: dataToUse.shippingCountry,
              }
            : {
                address: dataToUse.billingAddress,
                city: dataToUse.billingCity,
                state: dataToUse.billingState,
                zipCode: dataToUse.billingZipCode,
                country: dataToUse.billingCountry,
              },
        },
        total: finalTotal,
        subtotal: total,
        shipping: shippingCost,
        shippingMethod: shippingMethod?.name || "",
        howDidYouFindUs: dataToUse.howDidYouFindUs,
        userId: user?.id || null,
        protocolGuideSelected: protocolGuideSelected,
        protocolGuidePrice: protocolGuideSelected ? protocolGuidePrice : 0,
        nasalSpraySelected: nasalSpraySelected,
        nasalSprayPrice: nasalSpraySelected ? nasalSprayPrice : 0,
        discount: discount || null,
        affiliate: affiliate || null,
        storeCreditUsed: storeCreditUsed || 0,
      }

      console.log("[v0] Creating bank transfer order with data:", orderData)

      const result = await createBankTransferOrder(orderData)

      if (result.error) {
        toast({
          title: "Error generating order number",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.orderNumber) {
        // If store credit was used, deduct it from the user's balance
        if (storeCreditUsed && storeCreditUsed > 0 && user?.id) {
          try {
            const storeCreditResponse = await fetch('/api/store-credit/deduct', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                amount: storeCreditUsed,
                orderNumber: result.orderNumber
              })
            })

            const storeCreditResult = await storeCreditResponse.json()

            if (!storeCreditResponse.ok) {
              console.error('Store credit deduction failed:', storeCreditResult.error)
              toast({
                title: "Warning: Store credit not deducted",
                description: `Order created but store credit deduction failed: ${storeCreditResult.error}`,
                variant: "destructive",
              })
            } else {
              console.log('Store credit deducted successfully:', storeCreditResult)
              // Update local store credit balance
              setAvailableStoreCredit(storeCreditResult.newBalance)
              // Reset store credit usage
              setStoreCreditUsed(0)
              setUseStoreCredit(false)
              
              toast({
                title: "Order number generated!",
                description: `Your order number is #${result.orderNumber}. Store credit of $${storeCreditUsed.toFixed(2)} has been deducted from your account.`,
              })
            }
          } catch (error) {
            console.error('Error deducting store credit:', error)
            toast({
              title: "Warning: Store credit not deducted",
              description: "Order created but store credit deduction failed. Please contact support.",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Order number generated!",
            description: `Your order number is #${result.orderNumber}. Use this as your payment reference.`,
          })
        }
        
        if (result.orderNumber) {
          setBankTransferOrderNumber(result.orderNumber.toString())
        }
      }
    } catch (error) {
      console.error("Error generating order number:", error)
      toast({
        title: "Error generating order number",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingOrder(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("[v0] Form submission started")
    console.log("[v0] Current React state formData:", formData)

    setSubmitted(true)
    setForceShowErrors(true)

    const domData = collectFormDataFromDOM()
    const dataToUse = domData || formData

    console.log("[v0] Using form data:", dataToUse)

    // Strategy 2: Validate the collected data
    const validation = validateFormData(dataToUse)
    console.log("[v0] Validation result:", validation)

    if (!validation.isValid) {
      console.log("[v0] Form validation failed, showing toast")
      toast({
        title: "Please fill in all required fields",
        description: `${validation.errorCount} field(s) need attention`,
        variant: "destructive",
      })
      return
    }

    // Strategy 3: Final safety check
    const requiredFieldsCheck = [
      dataToUse.email?.trim(),
      dataToUse.phone?.trim(),
      dataToUse.firstName?.trim(),
      dataToUse.lastName?.trim(),
      dataToUse.shippingAddress?.trim(),
      dataToUse.shippingCity?.trim(),
      dataToUse.shippingState?.trim(),
      dataToUse.shippingZipCode?.trim(),
      dataToUse.shippingCountry?.trim(),
      dataToUse.howDidYouFindUs?.trim(),
    ]

    const emptyFields = requiredFieldsCheck.filter((field) => !field)
    if (emptyFields.length > 0) {
      console.log("[v0] Final safety check failed - empty fields detected:", emptyFields.length)
      toast({
        title: "Form validation error",
        description: "Some required fields are still empty",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] All validations passed, proceeding with order creation")
    setIsProcessing(true)

    try {
      const orderData: OrderData = {
        items,
        subtotal,
        shipping: shippingCost,
        total: finalTotal,
        discount: discount || null,
        affiliate: affiliate || null,
        shippingMethod: shippingMethod?.name || "",
        howDidYouFindUs: dataToUse.howDidYouFindUs,
        userId: user?.id || null,
        protocolGuideSelected,
        protocolGuidePrice,
        nasalSpraySelected,
        nasalSprayPrice,
        paymentMethod: dataToUse.paymentMethod || "stripe",
        cryptoCurrency: selectedCrypto,
        storeCreditUsed,
        customerInfo: {
          email: dataToUse.email,
          phone: dataToUse.phone,
          name: `${dataToUse.firstName} ${dataToUse.lastName}`,
          shippingAddress: {
            address: dataToUse.shippingAddress,
            city: dataToUse.shippingCity,
            state: dataToUse.shippingState,
            zipCode: dataToUse.shippingZipCode,
            country: dataToUse.shippingCountry,
          },
          billingAddress: dataToUse.sameAsBilling
            ? {
                address: dataToUse.shippingAddress,
                city: dataToUse.shippingCity,
                state: dataToUse.shippingState,
                zipCode: dataToUse.shippingZipCode,
                country: dataToUse.shippingCountry,
              }
            : {
                address: dataToUse.billingAddress,
                city: dataToUse.billingCity,
                state: dataToUse.billingState,
                zipCode: dataToUse.billingZipCode,
                country: dataToUse.billingCountry,
              },
        },
      }

      console.log("[v0] Creating order with data:", orderData)

      // Handle bank transfer payment method
      if (dataToUse.paymentMethod === "bank-transfer") {
        const response = await createOrder(orderData)
        
        if (response.error) {
          throw new Error(response.error)
        }

        // Clear saved form data on successful order creation
        localStorage.removeItem("checkout-form-data")
        
        // Show success message and redirect or show confirmation
        toast({
          title: "Order Created Successfully!",
          description: "Please complete your payment using the details provided above.",
          variant: "default",
        })
        
        // You can redirect to a success page or show order confirmation
        setIsProcessing(false)
        return
      }

      // Handle international bank payment method
      if (dataToUse.paymentMethod === "international-bank") {
        const response = await createBankTransferOrder(orderData)
        
        if (response.error) {
          throw new Error(response.error)
        }

        // Clear saved form data on successful order creation
        localStorage.removeItem("checkout-form-data")
        
        // Show success message and redirect or show confirmation
        toast({
          title: "Order Created Successfully!",
          description: `Your order number is #${response.orderNumber}. Please use the bank details to complete your transfer.`,
          variant: "default",
        })
        
        if (response.orderNumber) {
          setBankTransferOrderNumber(response.orderNumber.toString())
        }
        setShowBankModal(true)
        
        setIsProcessing(false)
        return
      }

      // Handle PayPal payment method (fallback)
      if (dataToUse.paymentMethod === "paypal") {
        // For PayPal fallback, we don't process payment here
        // User will use the PayPal link manually, so just show instructions
        toast({
          title: "PayPal Payment Required",
          description: "Please use the PayPal link below to complete your payment, then contact support.",
          variant: "default",
        })
        
        setIsProcessing(false)
        return
      }

      // Handle Transak payment method
      if (dataToUse.paymentMethod === "transak") {
        // Check if crypto is selected
        if (!selectedCrypto) {
          toast({
            title: "Please select a cryptocurrency",
            description: "Choose your preferred crypto before proceeding to Transak.",
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }

        // Create order in database first
        const response = await createTransakOrder(orderData)
        
        if (response.error) {
          throw new Error(response.error)
        }

        // Get crypto wallet addresses
        const walletAddresses = {
          BTC: "bc1q8s2zsdx3vzv00yhcnc0xyx8njjmnpnnxh34hdm",
          ETH: "0xD31445509265B472199312AB78571c2ef925F35f",
          USDC: "0xD31445509265B472199312AB78571c2ef925F35f",
          USDT: "0xD31445509265B472199312AB78571c2ef925F35f",
          LTC: "LYj9XwavmQr8mdoyF9kesZk8dNmXokTGmX"
        }

        // Create Transak widget URL
        const transakParams = new URLSearchParams({
          apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "",
          environment: "STAGING",
          productsAvailed: "BUY",
          exchangeScreenTitle: "Buy Crypto for OZPTides Order",
          fiatCurrency: "USD",
          fiatAmount: Math.round(finalTotal).toString(),
          cryptoCurrencyCode: selectedCrypto,
          paymentMethod: "credit_debit_card",
          walletAddress: walletAddresses[selectedCrypto as keyof typeof walletAddresses],
          networks: selectedCrypto === "BTC" ? "bitcoin" : selectedCrypto === "LTC" ? "litecoin" : "ethereum",
          referrerDomain: window.location.hostname,
          partnerOrderId: response.orderNumber?.toString() || "",
          email: dataToUse.email,
          firstName: dataToUse.firstName,
          lastName: dataToUse.lastName,
        })

        const transakUrl = `https://global.transak.com?${transakParams.toString()}`
        
        // Clear saved form data on successful order creation
        localStorage.removeItem("checkout-form-data")
        
        // Open Transak in new tab
        window.open(transakUrl, '_blank')
        
        toast({
          title: "Redirected to Transak",
          description: `Order #${response.orderNumber} created. Complete your crypto purchase in the new tab.`,
        })

        // Clear cart after successful order creation
        clearCart()
        setIsProcessing(false)
        return
      }

      // Use the selected shipping method or determine default based on country
      let currentShippingMethod = shippingMethod;
      console.log('=== SHIPPING METHOD DEBUG ===');
      console.log('Initial shippingMethod from context:', shippingMethod);
      console.log('shippingMethod is null?', shippingMethod === null);
      console.log('shippingMethod is undefined?', shippingMethod === undefined);
      console.log('Current shipping method before checkout:', currentShippingMethod);
      console.log('Shipping method ID:', currentShippingMethod?.id);
      console.log('Shipping method name:', currentShippingMethod?.name);
      
      // Get cart items with multiple fallbacks for shipping method determination
      let cartItemsForShipping: CartItem[] = [];
      
      // Fallback 1: Use items from context
      if (items && items.length > 0) {
        cartItemsForShipping = items;
        console.log('Using context items for shipping check');
      }
      // Fallback 2: Try localStorage directly (only if in browser)
      else if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const parsedItems = JSON.parse(savedCart);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              cartItemsForShipping = parsedItems;
              console.log('Using localStorage items for shipping check');
            }
          }
        } catch (error) {
          console.error('Failed to get cart items for shipping check:', error);
        }
      }
      
      console.log('Available methods for country:', getAvailableShippingMethods(dataToUse.shippingCountry || ''));
      console.log('Cart items for eligibility check:', cartItemsForShipping);
      console.log('Has eligible products:', checkNextDayEligibility(cartItemsForShipping));
      console.log('Checking if fallback needed:', !currentShippingMethod, dataToUse.shippingCountry);
      
      if (!currentShippingMethod && dataToUse.shippingCountry) {
        // Only set default if no method is selected
        console.log('No shipping method selected, setting default');
        const oceaniaCountries = ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'TO', 'TV', 'NR', 'KI', 'PW', 'MH', 'FM'];
        const isOceania = oceaniaCountries.includes(dataToUse.shippingCountry);
        
        if (isOceania) {
          currentShippingMethod = {
            id: "standard-au",
            name: "Standard Shipping (Oceania ONLY)",
            price: 25.00,
            description: "3-5 business days",
            eligibleCountries: ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'TO', 'TV', 'NR', 'KI', 'PW', 'MH', 'FM']
          };
          console.log('Set default Oceania shipping');
        } else {
          currentShippingMethod = {
            id: "express-intl",
            name: "Express International (Worldwide Dispatch)",
            price: 45.99,
            description: "5-10 business days",
            eligibleCountries: []
          };
          console.log('Set default International shipping');
        }
      } else {
        console.log('Using selected shipping method:', currentShippingMethod?.name);
      }

      // Calculate shipping cost with the correct method
      const correctShippingCost = !currentShippingMethod ? 0 :
        (currentShippingMethod.id === 'standard-au' && finalTotal >= 250) || 
        (currentShippingMethod.id === 'express-intl' && finalTotal >= 500)
          ? 0
          : currentShippingMethod.price;
      // Next Day Delivery is never free, always charges full price

      // Recalculate total with correct shipping cost
      const correctTotal = subtotal + correctShippingCost + (protocolGuideSelected ? protocolGuidePrice : 0) + (nasalSpraySelected ? nasalSprayPrice : 0);

      console.log('Final shipping method for order:', currentShippingMethod);
      console.log('Final shipping method name:', currentShippingMethod?.name);
      console.log('Final shipping cost:', correctShippingCost);
      console.log('=== END SHIPPING METHOD DEBUG ===');

      // Recreate order data with updated shipping method
      const updatedOrderData: OrderData = {
        items,
        subtotal,
        shipping: correctShippingCost,
        total: correctTotal,
        discount: discount || null,
        affiliate: affiliate || null,
        shippingMethod: currentShippingMethod?.name || "",
        howDidYouFindUs: dataToUse.howDidYouFindUs,
        userId: user?.id || null,
        protocolGuideSelected,
        protocolGuidePrice,
        nasalSpraySelected,
        nasalSprayPrice,
        paymentMethod: dataToUse.paymentMethod,
        storeCreditUsed,
        customerInfo: {
          email: dataToUse.email,
          phone: dataToUse.phone,
          name: `${dataToUse.firstName} ${dataToUse.lastName}`,
          shippingAddress: {
            address: dataToUse.shippingAddress,
            city: dataToUse.shippingCity,
            state: dataToUse.shippingState,
            zipCode: dataToUse.shippingZipCode,
            country: dataToUse.shippingCountry,
          },
          billingAddress: dataToUse.sameAsBilling
            ? {
                address: dataToUse.shippingAddress,
                city: dataToUse.shippingCity,
                state: dataToUse.shippingState,
                zipCode: dataToUse.shippingZipCode,
                country: dataToUse.shippingCountry,
              }
            : {
                address: dataToUse.billingAddress,
                city: dataToUse.billingCity,
                state: dataToUse.billingState,
                zipCode: dataToUse.billingZipCode,
                country: dataToUse.billingCountry,
              },
        },
      }

      // Handle Stripe payment method - use mixed checkout for subscriptions
      if (STRIPE_PAYMENTS_ENABLED) {
        const checkoutFunction = hasSubscriptionItems ? createMixedCheckoutSession : createOrder
        const [response, stripe] = await Promise.all([checkoutFunction(updatedOrderData), stripePromise])

        if (response.error || !response.sessionId) {
          throw new Error(response.error || "Failed to create session")
        }

        if (!stripe) {
          throw new Error("Stripe not initialized")
        }

        // Clear saved form data on successful order creation
        localStorage.removeItem("checkout-form-data")

        const { error } = await stripe.redirectToCheckout({ sessionId: response.sessionId })
        if (error) throw new Error(error.message)
      } else {
        // Stripe is disabled, should not reach here for PayPal
        throw new Error("Invalid payment method configuration")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleButtonClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isProcessing) return

      await handleSubmit()
    },
    [isProcessing],
  )

  const handleCountryChange = useCallback(
    (name: "shippingCountry" | "billingCountry", value: string) => {
      console.log(`[v0] Country changed - ${name}:`, value)

      setFormData((prev) => ({ ...prev, [name]: value }))
      setTouched((prev) => ({ ...prev, [name]: true }))

      // Clear error immediately for country selection
      if (value) {
        console.log(`[v0] Clearing country error for ${name}`)
        setErrors((prev) => {
          const next = { ...prev }
          delete (next as any)[name]
          return next
        })
        // Reset submitted state if all errors are cleared
        if (Object.keys(errors).length <= 1 && errors[name]) {
          console.log("[v0] Resetting submitted state - country error cleared")
          setSubmitted(false)
          setForceShowErrors(false)
        }
      }

      if (name === "shippingCountry") {
        // Only set default shipping method if none is currently selected
        if (!shippingMethod) {
          updateShippingMethodByCountry(value)
        }
        const isOceania = isOceaniaCountry(value)
        const threshold = isOceania ? 250 : 500
        if (total < threshold) {
          setShippingNotificationData({
            amountNeeded: threshold - total,
            isOceania,
            threshold,
          })
          setShowShippingNotification(true)
        }
      }
    },
    [errors, updateShippingMethodByCountry, isOceaniaCountry, total, shippingMethod],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      console.log(`[v0] Input changed - ${name}:`, `"${value}"`)

      setFormData((prev) => ({ ...prev, [name]: value }))
      setTouched((prev) => ({ ...prev, [name]: true }))

      // Real-time validation
      validateFieldRealTime(name as keyof FormErrors, value)

      // Reset submitted state if all errors are cleared
      if (Object.keys(errors).length <= 1 && errors[name as keyof FormErrors]) {
        console.log("[v0] Resetting submitted state - errors being cleared")
        setSubmitted(false)
        setForceShowErrors(false)
      }
    },
    [errors, validateFieldRealTime],
  )

  const loadSavedAddresses = useCallback(async (userId: string) => {
    try {
      const supabase = createClientSafe()
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })

      if (data) {
        setSavedAddresses(data)
        const defaultShipping = data.find((addr) => addr.type === "shipping" && addr.is_default)
        const defaultBilling = data.find((addr) => addr.type === "billing" && addr.is_default)

        if (defaultShipping) {
          setSelectedShippingAddress(defaultShipping.id)
          fillAddressFromSaved(defaultShipping, "shipping")
        }
        if (defaultBilling) {
          setSelectedBillingAddress(defaultBilling.id)
          fillAddressFromSaved(defaultBilling, "billing")
        }
      }
    } catch (error) {
      console.error("Address loading error:", error)
    }
  }, [])

  const fillAddressFromSaved = useCallback(
    (address: any, type: "shipping" | "billing") => {
      if (type === "shipping") {
        setFormData((prev) => ({
          ...prev,
          firstName: address.first_name,
          lastName: address.last_name,
          shippingAddress: address.address_line_1,
          shippingCity: address.city,
          shippingState: address.state,
          shippingZipCode: address.postal_code,
          shippingCountry: address.country,
        }))
        // Clear any existing shipping field errors after autofill (delete keys)
        setErrors((prev) => {
          const next = { ...prev }
          delete next.firstName
          delete next.lastName
          delete next.shippingAddress
          delete next.shippingCity
          delete next.shippingState
          delete next.shippingZipCode
          delete next.shippingCountry
          return next
        })
        // Only update shipping method if none is currently selected
        if (!shippingMethod) {
          updateShippingMethodByCountry(address.country)
        } else {
          console.log('Preserving existing shipping method during address autofill:', shippingMethod.name)
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          billingAddress: address.address_line_1,
          billingCity: address.city,
          billingState: address.state,
          billingZipCode: address.postal_code,
          billingCountry: address.country,
        }))
        // Clear any existing billing field errors after autofill (delete keys)
        setErrors((prev) => {
          const next = { ...prev }
          delete next.billingAddress
          delete next.billingCity
          delete next.billingState
          delete next.billingZipCode
          delete next.billingCountry
          return next
        })
      }
    },
    [updateShippingMethodByCountry],
  )

  const hasError = useCallback(
    (fieldName: keyof FormErrors) => {
      const hasErrorValue = !!errors[fieldName]
      const shouldShow = hasErrorValue && (submitted || touched[fieldName] === true || forceShowErrors)

      return shouldShow
    },
    [errors, submitted, touched, forceShowErrors],
  )

  const resetValidationState = useCallback(() => {
    console.log("[v0] Manually resetting validation state")
    setErrors({})
    setSubmitted(false)
    setForceShowErrors(false)
    setTouched({})
    localStorage.removeItem("checkout-form-data")
    toast({ title: "Validation state reset", description: "Please try submitting again" })
  }, [toast])

  const toggleValidationDebug = useCallback(() => {
    setValidationDebug((prev) => !prev)
  }, [])

  const [isPayPalNVPLoading, setIsPayPalNVPLoading] = useState(false)

  const handlePayPalNVP = useCallback(async () => {
    setIsPayPalNVPLoading(true)

    try {
      const orderData: OrderData = {
        items,
        subtotal,
        shipping: shippingCost,
        total: finalTotal,
        discount: discount || null,
        affiliate: affiliate || null,
        shippingMethod: shippingMethod?.name || "",
        howDidYouFindUs: formData.howDidYouFindUs,
        userId: user?.id || null,
        protocolGuideSelected,
        protocolGuidePrice,
        nasalSpraySelected,
        nasalSprayPrice,
        paymentMethod: "paypal",
        storeCreditUsed,
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: {
            address: formData.shippingAddress,
            city: formData.shippingCity,
            state: formData.shippingState,
            zipCode: formData.shippingZipCode,
            country: formData.shippingCountry,
          },
          billingAddress: formData.sameAsBilling
            ? {
                address: formData.shippingAddress,
                city: formData.shippingCity,
                state: formData.shippingState,
                zipCode: formData.shippingZipCode,
                country: formData.shippingCountry,
              }
            : {
                address: formData.billingAddress,
                city: formData.billingCity,
                state: formData.billingState,
                zipCode: formData.billingZipCode,
                country: formData.billingCountry,
              },
        },
      }

      const paypalUrl = `${PAYPAL_BASE_URL}/cgi-bin/webscr`
      const paypalParams = new URLSearchParams({
        cmd: "_xclick",
        business: "ozptides@gmail.com",
        item_name: "OZPTides Order",
        amount: finalTotal.toFixed(2),
        currency_code: "USD",
        return: `${window.location.href}?payment=success`,
        cancel_return: `${window.location.href}?payment=cancel`,
        notify_url: "/api/paypal-ipn",
      })

      const response = await fetch(paypalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: paypalParams.toString(),
      })

      if (response.ok) {
        const url = response.url
        window.location.href = url
      } else {
        throw new Error("Failed to redirect to PayPal")
      }
    } catch (error) {
      console.error("Error redirecting to PayPal:", error)
      toast({
        title: "Error redirecting to PayPal",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsPayPalNVPLoading(false)
    }
  }, [formData, finalTotal, shippingCost, shippingMethod, user, discount, affiliate, protocolGuideSelected, protocolGuidePrice, nasalSpraySelected, nasalSprayPrice])

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'CAD', label: 'CAD' },
    { value: 'NZD', label: 'NZD' },
  ];

  const formatBankCurrency = (amount: number, currency: string) => {
    switch (currency) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'GBP':
        return `£${amount.toFixed(2)}`;
      case 'CAD':
        return `$${amount.toFixed(2)} CAD`;
      case 'NZD':
        return `$${amount.toFixed(2)} NZD`;
      default:
        return `$${amount.toFixed(2)}`;
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    const conversionRates: Record<string, number> = {
      USD: 1,
      EUR: 0.88,
      GBP: 0.76,
      CAD: 1.41,
      NZD: 1.78,
    };

    return amount * (conversionRates[toCurrency] || 1) / (conversionRates[fromCurrency] || 1);
  };

  const [showBankModal, setShowBankModal] = useState(false);

  const [bankDetails, setBankDetails] = useState<Record<string, BankDetails>>({
    USD: {
      currency: 'USD',
      bankName: 'Community Federal Savings Bank',
      accountHolder: 'Kareshma Kumar',
      accountNumber: '8314510747',
      swiftCode: 'CMFGUS33',
      routingNumber: '026073150',
      address: '89-16 Jamaica Ave, Woodhaven, NY, 11421, United States'
    },
    EUR: {
      currency: 'EUR',
      bankName: 'Wise',
      accountHolder: 'Kareshma Kumar',
      accountNumber: 'N/A - EUR Bank does not use ACN',
      swiftCode: 'TRWIBEB1XXX',
      iban: 'BE48905275501427',
      address: 'Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium'
    },
    GBP: {
      currency: 'GBP',
      bankName: 'Wise Payments Limited',
      accountHolder: 'Kareshma Kumar',
      accountNumber: '55587526',
      swiftCode: 'TRWIGB2LXXX',
      iban: 'GB94TRWI23080155587526',
      sortCode: '23-08-01',
      address: '1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom'
    },
    CAD: {
      currency: 'CAD',
      bankName: 'Wise Payments Canada Inc.',
      accountHolder: 'Kareshma Kumar',
      accountNumber: '200117210326',
      swiftCode: 'TRWICAW1XXX',
      institutionNumber: '621',
      transitNumber: '16001',
      address: '99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada'
    },
    NZD: {
      currency: 'NZD',
      bankName: 'Wise Payments Ltd. - New Zealand Branch',
      accountHolder: 'Kareshma Kumar',
      accountNumber: '04-2021-0229882-01',
      swiftCode: 'TRWINZ21XXX',
      address: '1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom'
    }
  })

  return (
    <>
      {showShippingNotification && shippingNotificationData && (
        <CheckoutShippingNotification
          isVisible={showShippingNotification}
          onDismiss={() => setShowShippingNotification(false)}
          amountNeeded={shippingNotificationData.amountNeeded}
          isOceania={shippingNotificationData.isOceania}
          threshold={shippingNotificationData.threshold}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {STRIPE_TEST_MODE && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Test Mode Active</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Use test card <code className="bg-yellow-200 px-1 rounded">4242 4242 4242 4242</code> - No real
                    charges
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {validationDebug && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Validation Debug Panel</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>
                <strong>Submitted:</strong> {submitted.toString()}
              </p>
              <p>
                <strong>Force Show Errors:</strong> {forceShowErrors.toString()}
              </p>
              <p>
                <strong>Error Count:</strong> {Object.keys(errors).length}
              </p>
              <p>
                <strong>Errors:</strong> {JSON.stringify(errors, null, 2)}
              </p>
              <p>
                <strong>Last Validation:</strong> {new Date(lastValidation.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="mt-2 space-x-2">
              <Button size="sm" variant="outline" onClick={resetValidationState}>
                Reset Validation
              </Button>
              <Button size="sm" variant="outline" onClick={() => collectFormDataFromDOM()}>
                Test DOM Collection
              </Button>
            </div>
          </div>
        )}

        <USAShippingNotice />

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <div className="flex items-center gap-4">
            {user && <div className="text-sm text-muted-foreground">Signed in as {user.email}</div>}
            <Button size="sm" variant="ghost" onClick={toggleValidationDebug}>
              {validationDebug ? "Hide Debug" : "Show Debug"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={hasError("email") ? "border-red-500 bg-red-50" : "border-gray-300"}
                    />
                    {hasError("email") && (
                      <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.email}</div>
                    )}
                    {formData.email && !hasError("email") && (
                      <div className="absolute right-2 top-2 text-green-500">✓</div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={hasError("phone") ? "border-red-500 bg-red-50" : "border-gray-300"}
                    />
                    {hasError("phone") && (
                      <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.phone}</div>
                    )}
                    {formData.phone && !hasError("phone") && (
                      <div className="absolute right-2 top-2 text-green-500">✓</div>
                    )}
                  </div>
                  <div className="col-span-2 relative">
                    <Label htmlFor="howDidYouFindUs" className="text-sm font-medium">
                      How did you find us? *
                    </Label>
                    <Input
                      name="howDidYouFindUs"
                      placeholder="Please tell us how you found us"
                      value={formData.howDidYouFindUs}
                      onChange={handleInputChange}
                      required
                      className={hasError("howDidYouFindUs") ? "border-red-500 bg-red-50" : "border-gray-300"}
                    />
                    {hasError("howDidYouFindUs") && (
                      <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.howDidYouFindUs}</div>
                    )}
                    {formData.howDidYouFindUs && !hasError("howDidYouFindUs") && (
                      <div className="absolute right-2 top-8 text-green-500">✓</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <Label>Saved Shipping Addresses</Label>
                      <SearchableSelect
                        options={[
                          { value: "", label: "Enter new address" },
                          ...savedAddresses
                            .filter((addr) => addr.type === "shipping")
                            .map((addr) => ({
                              value: addr.id,
                              label: `${addr.first_name} ${addr.last_name} - ${addr.address_line_1}, ${addr.city}`,
                            })),
                        ]}
                        value={selectedShippingAddress}
                        onValueChange={(value) => {
                          setSelectedShippingAddress(value)
                          if (value) {
                            const address = savedAddresses.find((addr) => addr.id === value)
                            if (address) fillAddressFromSaved(address, "shipping")
                          }
                        }}
                        placeholder="Select a saved address"
                        searchPlaceholder="Search addresses..."
                        emptyText="No saved addresses found"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className={hasError("firstName") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {hasError("firstName") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.firstName}</div>
                      )}
                      {formData.firstName && !hasError("firstName") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className={hasError("lastName") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {hasError("lastName") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.lastName}</div>
                      )}
                      {formData.lastName && !hasError("lastName") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                    <div className="col-span-2 relative">
                      <Input
                        name="shippingAddress"
                        placeholder="Address"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        required
                        className={hasError("shippingAddress") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {hasError("shippingAddress") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.shippingAddress}</div>
                      )}
                      {formData.shippingAddress && !hasError("shippingAddress") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        name="shippingCity"
                        placeholder="City"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        required
                        className={hasError("shippingCity") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {hasError("shippingCity") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.shippingCity}</div>
                      )}
                      {formData.shippingCity && !hasError("shippingCity") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        name="shippingState"
                        placeholder="State"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        required
                        className={hasError("shippingState") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {hasError("shippingState") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.shippingState}</div>
                      )}
                      {formData.shippingState && !hasError("shippingState") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        name="shippingZipCode"
                        placeholder="ZIP Code"
                        value={formData.shippingZipCode}
                        onChange={handleInputChange}
                        required
                        className={hasError("shippingZipCode") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {hasError("shippingZipCode") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                          {errors.shippingZipCode}
                        </div>
                      )}
                      {formData.shippingZipCode && !hasError("shippingZipCode") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                    <div className="relative">
                      <SearchableSelect
                        options={COUNTRIES}
                        value={formData.shippingCountry}
                        onValueChange={(value) => handleCountryChange("shippingCountry", value)}
                        placeholder="Select country"
                        searchPlaceholder="Search..."
                        emptyText="No countries found"
                        className={hasError("shippingCountry") ? "border-red-500 bg-red-50" : "border-gray-300"}
                      />
                      {/* Hidden input mirrors the searchable select so FormData picks up the value */}
                      <input type="hidden" name="shippingCountry" value={formData.shippingCountry} />
                      {hasError("shippingCountry") && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.shippingCountry}</div>
                      )}
                      {formData.shippingCountry && !hasError("shippingCountry") && (
                        <div className="absolute right-2 top-2 text-green-500">✓</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method Selection */}
              {formData.shippingCountry && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const availableMethods = getAvailableShippingMethods(formData.shippingCountry);
                      console.log('Available methods in UI:', availableMethods);
                      console.log('Cart items for eligibility check:', items);
                      console.log('Current selected method:', shippingMethod);
                      
                      if (availableMethods.length === 1) {
                        // Only one method available, show it as selected
                        const method = availableMethods[0];
                        return (
                          <div className="p-4 border border-blue-500 rounded-lg bg-blue-500/10">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-white">{method.name}</h3>
                                <p className="text-sm text-gray-400">{method.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-white">
                                  {(() => {
                                    const isFree = (method.id === 'standard-au' && finalTotal >= 250) || 
                                                   (method.id === 'express-intl' && finalTotal >= 500);
                                    return isFree ? 'FREE' : formatCurrency(method.price);
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Multiple methods available, show selection
                      return (
                        <RadioGroup 
                          value={shippingMethod?.id || availableMethods[0].id} 
                          onValueChange={(value) => {
                            const selectedMethod = availableMethods.find((m: any) => m.id === value);
                            if (selectedMethod) {
                              console.log('=== USER SELECTED SHIPPING METHOD ===');
                              console.log('Selected method:', selectedMethod);
                              console.log('Method ID:', selectedMethod.id);
                              console.log('Method name:', selectedMethod.name);
                              setShippingMethod(selectedMethod);
                              console.log('Shipping method set in context');
                              // Force re-render to ensure state is updated
                              setFormData(prev => ({ ...prev }));
                            }
                          }}
                          className="space-y-3"
                        >
                          {availableMethods.map((method: any) => {
                            const isFree = (method.id === 'standard-au' && finalTotal >= 250) || 
                                          (method.id === 'express-intl' && finalTotal >= 500);
                            // Next Day Delivery is never free, always charges full price

                            return (
                              <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-800/50">
                                <RadioGroupItem value={method.id} id={method.id} />
                                <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="font-medium text-white">{method.name}</h3>
                                      <p className="text-sm text-gray-400">{method.description}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-white">
                                        {isFree ? 'FREE' : formatCurrency(method.price)}
                                      </p>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Checkbox
                      id="sameAsBilling"
                      name="sameAsBilling"
                      checked={formData.sameAsBilling}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor="sameAsBilling"
                      className="ml-2 block text-sm text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Same as shipping address
                    </label>
                  </div>
                  {!formData.sameAsBilling && (
                    <div className="space-y-4">
                      {user && savedAddresses.length > 0 && (
                        <div className="space-y-2">
                          <Label>Saved Billing Addresses</Label>
                          <SearchableSelect
                            options={[
                              { value: "", label: "Enter new address" },
                              ...savedAddresses
                                .filter((addr) => addr.type === "billing")
                                .map((addr) => ({
                                  value: addr.id,
                                  label: `${addr.first_name} ${addr.last_name} - ${addr.address_line_1}, ${addr.city}`,
                                })),
                            ]}
                            value={selectedBillingAddress}
                            onValueChange={(value) => {
                              setSelectedBillingAddress(value)
                              if (value) {
                                const address = savedAddresses.find((addr) => addr.id === value)
                                if (address) fillAddressFromSaved(address, "billing")
                              }
                            }}
                            placeholder="Select a saved address"
                            searchPlaceholder="Search addresses..."
                            emptyText="No saved addresses found"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <Input
                            name="billingAddress"
                            placeholder="Address"
                            value={formData.billingAddress}
                            onChange={handleInputChange}
                            required={!formData.sameAsBilling}
                            className={hasError("billingAddress") ? "border-red-500 bg-red-50" : "border-gray-300"}
                          />
                          {hasError("billingAddress") && (
                            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                              {errors.billingAddress}
                            </div>
                          )}
                          {formData.billingAddress && !hasError("billingAddress") && (
                            <div className="absolute right-2 top-2 text-green-500">✓</div>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            name="billingCity"
                            placeholder="City"
                            value={formData.billingCity}
                            onChange={handleInputChange}
                            required={!formData.sameAsBilling}
                            className={hasError("billingCity") ? "border-red-500 bg-red-50" : "border-gray-300"}
                          />
                          {hasError("billingCity") && (
                            <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.billingCity}</div>
                          )}
                          {formData.billingCity && !hasError("billingCity") && (
                            <div className="absolute right-2 top-2 text-green-500">✓</div>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            name="billingState"
                            placeholder="State"
                            value={formData.billingState}
                            onChange={handleInputChange}
                            required={!formData.sameAsBilling}
                            className={hasError("billingState") ? "border-red-500 bg-red-50" : "border-gray-300"}
                          />
                          {hasError("billingState") && (
                            <div className="absolute -bottom-5 left-0 text-xs text-red-500">{errors.billingState}</div>
                          )}
                          {formData.billingState && !hasError("billingState") && (
                            <div className="absolute right-2 top-2 text-green-500">✓</div>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            name="billingZipCode"
                            placeholder="ZIP Code"
                            value={formData.billingZipCode}
                            onChange={handleInputChange}
                            required={!formData.sameAsBilling}
                            className={hasError("billingZipCode") ? "border-red-500 bg-red-50" : "border-gray-300"}
                          />
                          {hasError("billingZipCode") && (
                            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                              {errors.billingZipCode}
                            </div>
                          )}
                          {formData.billingZipCode && !hasError("billingZipCode") && (
                            <div className="absolute right-2 top-2 text-green-500">✓</div>
                          )}
                        </div>
                        <div className="relative">
                          <SearchableSelect
                            options={COUNTRIES}
                            value={formData.billingCountry}
                            onValueChange={(value) => handleCountryChange("billingCountry", value)}
                            placeholder="Select a country"
                            searchPlaceholder="Search countries..."
                            emptyText="No countries found"
                            className={hasError("billingCountry") ? "border-red-500 bg-red-50" : "border-gray-300"}
                          />
                          {/* Hidden input mirrors the searchable select so FormData picks up the value */}
                          <input type="hidden" name="billingCountry" value={formData.billingCountry} />
                          {hasError("billingCountry") && (
                            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                              {errors.billingCountry}
                            </div>
                          )}
                          {formData.billingCountry && !hasError("billingCountry") && (
                            <div className="absolute right-2 top-2 text-green-500">✓</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Store Credit Section */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      Store Credit
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      Available: {formatCurrency(availableStoreCredit)}
                      {availableStoreCredit === 0 && " (No store credit available)"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {availableStoreCredit > 0 ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useStoreCredit"
                            checked={useStoreCredit}
                            onCheckedChange={(checked) => {
                              setUseStoreCredit(!!checked)
                              if (checked) {
                                // Use maximum available or remaining total, whichever is smaller
                                const maxUsable = Math.min(availableStoreCredit, total + (formData.shippingCountry ? shippingCost : 0))
                                setStoreCreditUsed(maxUsable)
                              } else {
                                setStoreCreditUsed(0)
                              }
                            }}
                          />
                          <label
                            htmlFor="useStoreCredit"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Use store credit for this order
                          </label>
                        </div>
                        
                        {useStoreCredit && (
                          <div className="space-y-2">
                            <Label htmlFor="storeCreditAmount">Amount to use</Label>
                            <div className="relative">
                              <Input
                                id="storeCreditAmount"
                                type="number"
                                min="0"
                                max={Math.min(availableStoreCredit, total + (formData.shippingCountry ? shippingCost : 0))}
                                step="0.01"
                                value={storeCreditUsed || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0
                                  const maxUsable = Math.min(availableStoreCredit, total + (formData.shippingCountry ? shippingCost : 0))
                                  if (value <= maxUsable && value >= 0) {
                                    setStoreCreditUsed(value)
                                  }
                                }}
                                placeholder="0.00"
                                className="pr-16"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-sm text-gray-500">USD</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Maximum: {formatCurrency(Math.min(availableStoreCredit, total + (formData.shippingCountry ? shippingCost : 0)))}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        You don't have any store credit available. Store credit can be earned through refunds or promotional offers.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    
                    {/* PayID & Bank Transfer Option */}
                    <div 
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.paymentMethod === "bank-transfer" 
                          ? "border-primary bg-primary/5 shadow-lg" 
                          : "border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "bank-transfer" }))}
                    >
                      <input
                        type="radio"
                        id="bank-transfer"
                        name="paymentMethod"
                        value="bank-transfer"
                        checked={formData.paymentMethod === "bank-transfer"}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.paymentMethod === "bank-transfer" 
                                ? "border-primary bg-primary" 
                                : "border-gray-600"
                            }`}>
                              {formData.paymentMethod === "bank-transfer" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white">Alternative Payment Models</div>
                              <div className="text-sm text-gray-400">PayID, Bank Transfer, Gift Card, Crypto</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <img src="/payid.svg" alt="PayID" className="h-8 w-auto opacity-80" />
                          <div className="px-3 py-1 bg-gray-700 rounded text-sm font-medium text-gray-300">BANK</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* International Bank Payments Option */}
                    <div 
                      className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                        !BANK_PAYMENTS_ENABLED 
                          ? "border-gray-700 bg-gray-900/30 opacity-60 cursor-not-allowed" 
                          : formData.paymentMethod === "international-bank" 
                            ? "border-primary bg-primary/5 shadow-lg cursor-pointer" 
                            : "border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (BANK_PAYMENTS_ENABLED) {
                          setFormData(prev => ({ ...prev, paymentMethod: "international-bank" }))
                        }
                      }}
                    >
                      <input
                        type="radio"
                        id="international-bank"
                        name="paymentMethod"
                        value="international-bank"
                        checked={formData.paymentMethod === "international-bank"}
                        onChange={(e) => {
                          if (BANK_PAYMENTS_ENABLED) {
                            setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))
                          }
                        }}
                        disabled={!BANK_PAYMENTS_ENABLED}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              !BANK_PAYMENTS_ENABLED
                                ? "border-gray-600 bg-gray-800"
                                : formData.paymentMethod === "international-bank" 
                                  ? "border-primary bg-primary" 
                                  : "border-gray-600"
                            }`}>
                              {formData.paymentMethod === "international-bank" && BANK_PAYMENTS_ENABLED && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold ${!BANK_PAYMENTS_ENABLED ? 'text-gray-500' : 'text-white'}`}>
                                International Bank Payments
                              </div>
                              <div className={`text-sm ${!BANK_PAYMENTS_ENABLED ? 'text-gray-600' : 'text-gray-400'}`}>
                                {!BANK_PAYMENTS_ENABLED ? 'Temporarily Disabled. Please contact us with your currency in live chat and we will manually provide the bank account details. (30+ Currencies Supported)' : 'USD, EUR, GBP, CAD, NZD'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building2 className={`h-8 w-8 opacity-80 ${!BANK_PAYMENTS_ENABLED ? 'text-gray-600' : 'text-primary'}`} />
                          <Globe className={`h-6 w-6 ${!BANK_PAYMENTS_ENABLED ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                    
                    

                  {formData.paymentMethod === "bank-transfer" && (
                    <div className="mt-6 p-6 bg-gray-900/50 border border-gray-700 rounded-xl">
                      <h3 className="font-semibold text-lg mb-6 text-white flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-primary" />
                        Payment Details
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-primary mb-3 flex items-center">
                              <Banknote className="w-4 h-4 mr-2" />
                              Bank Transfer Details (International)
                            </h4>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">BSB:</span>
                                <span className="font-mono font-medium text-white">772772</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Account:</span>
                                <span className="font-mono font-medium text-white">103309027</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Name:</span>
                                <span className="font-medium text-white">Kareshma Kumar</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Currency:</span>
                                <span className="font-medium text-white">USD</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Total in AUD:</span>
                                <span className="font-medium text-white">${(finalTotal * 1.5899).toFixed(2)} AUD</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-primary mb-3 flex items-center">
                              <Banknote className="w-4 h-4 mr-2" />
                              PayID (Domestic)
                            </h4>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">PayID:</span>
                                <span className="font-mono font-medium text-white">payments@ozptides.com</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Total in AUD:</span>
                                <span className="font-medium text-white">${(finalTotal * 1.5899).toFixed(2)} AUD</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-primary mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Pay via Card with Gift Cards
                          </h4>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Total in USD:</span>
                              <span className="font-medium text-white">${finalTotal.toFixed(2)} USD</span>
                            </div>
                            <div className="space-y-3">
                              <p className="text-sm text-gray-300">
                                Purchase a gift card and send us the code for instant processing:
                              </p>
                              <a
                                href="https://www.g2a.com/rewarble-super-gift-card-15-usd-by-rewarble-key-global-i10000506957019"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Buy Gift Card
                              </a>
                              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                                <h5 className="font-medium mb-2 text-blue-400">Instructions:</h5>
                                <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
                                  <li>Click on the 'Pay' Button</li>
                                  <li>Set Region to 'AUSTRALIA'</li>
                                  <li>Select the order amount in USD rounded up to the nearest digit available</li>
                                  <li>Checkout and send us the code in live support</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-primary mb-3 flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Cryptocurrency Payment
                          </h4>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4">
                            <div className="flex items-start space-x-3">
                              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <h5 className="font-medium text-blue-300 mb-2">Crypto Payment Available (5% Discount)</h5>
                                <p className="text-sm text-gray-300 mb-3">
                                  We accept cryptocurrency payments! For crypto transactions, please contact our support team through live chat.
                                </p>
                                <p className="text-xs text-gray-400">
                                  Please provide the Order ID (Generate Below) and cryptocurrency of choice. Our team will handle the rest automatically
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-center pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  // Trigger live chat or contact method
                                  if (window.$crisp) {
                                    window.$crisp.push(['do', 'chat:open'])
                                  }
                                  toast({
                                    title: "Live Chat Opening",
                                    description: "Please mention you'd like to pay with cryptocurrency.",
                                  })
                                }}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Contact Support for Crypto Payment</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        {/* Get Order Number Button */}
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                          <h4 className="font-medium text-primary mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Step 1: Get Your Order Number
                          </h4>
                          {!bankTransferOrderNumber ? (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-300">
                                Click below to generate your order number. Use this number as the payment reference when making your bank transfer.
                              </p>
                              {storeCreditUsed && storeCreditUsed > 0 && (
                                <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                                  <div className="flex items-start space-x-2">
                                    <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                      <p className="text-sm font-medium text-amber-300">Store Credit Will Be Deducted</p>
                                      <p className="text-xs text-amber-200 mt-1">
                                        ${storeCreditUsed.toFixed(2)} in store credit will be immediately deducted from your account when you generate the order number.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={handleGetOrderNumber}
                                disabled={isGeneratingOrder}
                                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                              >
                                {isGeneratingOrder ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Order...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Get Order #
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <div>
                                    <p className="text-sm font-medium text-green-300">Order Number Generated</p>
                                    <p className="text-xs text-green-200">Your order number: #{bankTransferOrderNumber}</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400">
                                Use this order number as your payment reference when making the bank transfer.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                          <h4 className="font-semibold text-amber-400 mb-2">Transfer Instructions</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Click "View Bank Details" to get complete transfer information</li>
                            <li>• Use the exact amount shown above</li>
                            <li>• Include your order number in the transfer reference</li>
                            <li>• Australian Bank Transfers or PayID take 30 minutes to an hour to confirm. Most times it is instant</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {formData.paymentMethod === "international-bank" && (
                <div className="mt-6 p-6 bg-gray-900/50 border border-gray-700 rounded-xl">
                  <h3 className="font-semibold text-lg mb-6 text-white flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-primary" />
                    International Bank Transfer
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Currency Selection */}
                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-300 mb-2 block">
                        Select Currency
                      </Label>
                      <select
                        id="currency"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount Display */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Amount to Transfer:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatBankCurrency(convertCurrency(finalTotal, 'USD', selectedCurrency), selectedCurrency)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Converted from USD ${finalTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Bank Details Button */}
                    <Button
                      type="button"
                      onClick={() => setShowBankModal(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      View Bank Details for {selectedCurrency}
                    </Button>

                    {/* Instructions */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-400 mb-2">Transfer Instructions</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Click "View Bank Details" to get complete transfer information</li>
                        <li>• Use the exact amount shown above</li>
                        <li>• Include your order number in the transfer reference</li>
                        <li>• Transfers typically take 1-3 business days to process</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Get Order Number Button */}
              {formData.paymentMethod === "international-bank" && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <h4 className="font-medium text-primary mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Step 1: Get Your Order Number
                  </h4>
                  {!bankTransferOrderNumber ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Click below to generate your order number. Use this number as the payment reference when making your bank transfer.
                      </p>
                      {storeCreditUsed && storeCreditUsed > 0 && (
                        <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-amber-300">Store Credit Will Be Deducted</p>
                              <p className="text-xs text-amber-200 mt-1">
                                ${storeCreditUsed.toFixed(2)} in store credit will be immediately deducted from your account when you generate the order number.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleGetOrderNumber}
                        disabled={isGeneratingOrder}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {isGeneratingOrder ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Order...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Get Order #
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-green-300">Order Number Generated</p>
                            <p className="text-xs text-green-200">Your order number: #{bankTransferOrderNumber}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        Use this order number as your payment reference when making the bank transfer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                {STRIPE_TEST_MODE && (
                  <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">🧪 Test Mode</div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <p>
                      {item.name} x{item.quantity}
                    </p>
                    <p>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>{formatCurrency(subtotal)}</p>
                </div>
                {discount && (
                  <div className="flex justify-between text-green-600">
                    <p>Discount ({discount.code})</p>
                    <p>-{formatCurrency(discount.amountSaved)}</p>
                  </div>
                )}
                {affiliate && (
                  <div className="flex justify-between text-blue-600">
                    <p>Affiliate ({affiliate.code})</p>
                    <p>-{formatCurrency(affiliate.amountSaved)}</p>
                  </div>
                )}
                {storeCreditUsed > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Store Credit Used</p>
                    <p>-{formatCurrency(storeCreditUsed)}</p>
                  </div>
                )}
                {nasalSpraySelected && (
                  <div className="flex justify-between">
                    <p>Nasal Spray Form</p>
                    <p>{formatCurrency(nasalSprayPrice)}</p>
                  </div>
                )}
                {protocolGuideSelected && (
                  <div className="flex justify-between">
                    <p>Protocol Guide</p>
                    <p>{formatCurrency(protocolGuidePrice)}</p>
                  </div>
                )}
                {formData.shippingCountry && (
                  <div className="flex justify-between">
                    <p>Shipping ({shippingMethod?.name || "TBD"})</p>
                    <p>{formatCurrency(shippingCost)}</p>
                  </div>
                )}
                {processingFee > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <p className="text-sm">
                      Processing Fee
                      <span className="text-xs text-muted-foreground block">
                        {formData.paymentMethod === 'paypal' ? '5% PayPal surcharge' : '3.5% + $0.30'}
                      </span>
                    </p>
                    <p>{formatCurrency(processingFee)}</p>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>{formatCurrency(finalTotal)}</p>
                </div>
                {formData.paymentMethod !== "paypal" && (
                <Button
                  type={formData.paymentMethod === "paypal" ? "button" : "submit"}
                  onClick={formData.paymentMethod === "paypal" ? (e) => {
                    e.preventDefault()
                    // Find and trigger the PayPal component's handlePayPalPayment function
                    const paypalButton = document.querySelector('[data-paypal-button]') as HTMLButtonElement
                    if (paypalButton) {
                      paypalButton.click()
                    }
                  } : undefined}
                  disabled={isSubmitting || isProcessing || !formData.paymentMethod}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    formData.paymentMethod === "paypal" 
                      ? "bg-[#0070ba] hover:bg-[#005ea6] disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
                      : "bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
                  }`}
                  style={{
                    WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                    touchAction: "manipulation",
                    cursor: "pointer",
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {formData.paymentMethod === "bank-transfer"
                        ? "Payment Complete"
                        : formData.paymentMethod === "transak"
                        ? "Proceed to Transak"
                        : STRIPE_TEST_MODE 
                        ? "Complete Test Order" 
                        : "Complete Order"
                      }
                    </span>
                  )}
                </Button>
                )}
                
                {/* Product Name Explanation */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>Why are product names different on the checkout page?</span>
                  <div className="group relative">
                    <svg 
                      className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-50">
                      <div className="text-center">
                        <p className="font-medium mb-1">Payment Processor Safety</p>
                        <p>Product names are modified with compliant prefixes for payment processor requirements. This is purely for safety purposes - you'll receive the exact products shown in your cart.</p>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-center text-muted-foreground">
                  {Object.keys(errors).length === 0 ? (
                    <span className="text-green-600">✓ Form is valid</span>
                  ) : (
                    <span className="text-red-600">{Object.keys(errors).length} field(s) need attention</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Crypto Payment Modal */}
      {showCryptoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Waiting for Agent
              </h3>
              <p className="text-gray-300 mb-6">
                Please wait for an agent to connect to confirm your payment. 
                The live chat should open automatically.
              </p>
              <button
                onClick={() => setShowCryptoModal(false)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Modal for PayPal */}
      <CookieConsentModal
        isOpen={showCookieModal}
        onClose={() => {
          setShowCookieModal(false)
          // If user cancels, reset payment method to prevent PayPal usage
          setFormData(prev => ({ 
            ...prev, 
            paymentMethod: STRIPE_PAYMENTS_ENABLED ? "stripe" : "bank-transfer" 
          }))
          toast({
            title: "PayPal Disabled",
            description: "PayPal requires third-party cookies. Please select another payment method.",
            variant: "destructive"
          })
        }}
        onAccept={async () => {
          setShowCookieModal(false)
          // Set PayPal as payment method after accepting cookies
          setFormData(prev => ({ ...prev, paymentMethod: "paypal" }))
          // Try to request storage access
          await requestStorageAccess()
          toast({
            title: "Cookies Enabled",
            description: "Third-party cookies have been enabled for PayPal functionality.",
          })
        }}
      />

      <CheckoutDebugButton 
        formData={formData} 
        errors={errors}
        isProcessing={isProcessing}
        stripeInitialized={true}
        finalTotal={finalTotal}
      />

      {/* International Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Bank Transfer Details</h3>
                    <p className="text-sm text-gray-400">{selectedCurrency} - {bankDetails[selectedCurrency]?.bankName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Amount Display */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Amount to Transfer:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatBankCurrency(convertCurrency(finalTotal, 'USD', selectedCurrency), selectedCurrency)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Converted from USD ${finalTotal.toFixed(2)}
                </p>
              </div>

              {/* Bank Details Grid */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Bank Information
                </h4>

                <div className="grid gap-3">
                  {/* Bank Name */}
                  <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Bank Name</p>
                      <p className="font-medium text-white mt-1">{bankDetails[selectedCurrency]?.bankName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.bankName || '', 'Bank Name')}
                      className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Account Holder */}
                  <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Account Holder</p>
                      <p className="font-medium text-white mt-1">{bankDetails[selectedCurrency]?.accountHolder}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.accountHolder || '', 'Account Holder')}
                      className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Account Number - only show if exists */}
                  {bankDetails[selectedCurrency]?.accountNumber && (
                    <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Account Number</p>
                        <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.accountNumber || '', 'Account Number')}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* SWIFT Code */}
                  <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">SWIFT Code</p>
                      <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.swiftCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.swiftCode || '', 'SWIFT Code')}
                      className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* IBAN - only show if exists */}
                  {bankDetails[selectedCurrency]?.iban && (
                    <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">IBAN</p>
                        <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.iban}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.iban || '', 'IBAN')}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Routing Number - only show if exists */}
                  {bankDetails[selectedCurrency]?.routingNumber && (
                    <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Routing Number</p>
                      <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.routingNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.routingNumber || '', 'Routing Number')}
                      className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  )}

                  {/* Sort Code - only show if exists */}
                  {bankDetails[selectedCurrency]?.sortCode && (
                    <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Sort Code</p>
                        <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.sortCode}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.sortCode || '', 'Sort Code')}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Institution Number - only show if exists */}
                  {bankDetails[selectedCurrency]?.institutionNumber && (
                    <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Institution Number</p>
                        <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.institutionNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.institutionNumber || '', 'Institution Number')}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Transit Number - only show if exists */}
                  {bankDetails[selectedCurrency]?.transitNumber && (
                    <div className="flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Transit Number</p>
                        <p className="font-mono text-white mt-1">{bankDetails[selectedCurrency]?.transitNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.transitNumber || '', 'Transit Number')}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Bank Address */}
                  <div className="flex items-start justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Bank Address
                      </p>
                      <p className="text-white mt-1 leading-relaxed">{bankDetails[selectedCurrency]?.address}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails[selectedCurrency]?.address || '', 'Bank Address')}
                      className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors ml-3 mt-1"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const allDetails = `
Bank Transfer Details for ${selectedCurrency}

Bank Name: ${bankDetails[selectedCurrency]?.bankName}
Account Holder: ${bankDetails[selectedCurrency]?.accountHolder}
${bankDetails[selectedCurrency]?.accountNumber ? `Account Number: ${bankDetails[selectedCurrency]?.accountNumber}` : ''}
SWIFT Code: ${bankDetails[selectedCurrency]?.swiftCode}
${bankDetails[selectedCurrency]?.iban ? `IBAN: ${bankDetails[selectedCurrency]?.iban}` : ''}
${bankDetails[selectedCurrency]?.routingNumber ? `Routing Number: ${bankDetails[selectedCurrency]?.routingNumber}` : ''}
${bankDetails[selectedCurrency]?.sortCode ? `Sort Code: ${bankDetails[selectedCurrency]?.sortCode}` : ''}
${bankDetails[selectedCurrency]?.institutionNumber ? `Institution Number: ${bankDetails[selectedCurrency]?.institutionNumber}` : ''}
${bankDetails[selectedCurrency]?.transitNumber ? `Transit Number: ${bankDetails[selectedCurrency]?.transitNumber}` : ''}
Bank Address: ${bankDetails[selectedCurrency]?.address}

Amount to Transfer: ${formatBankCurrency(convertCurrency(finalTotal, 'USD', selectedCurrency), selectedCurrency)}
                    `.trim()
                      copyToClipboard(allDetails, 'All Bank Details')
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy All Details
                  </button>
                  <button
                    onClick={() => setShowBankModal(false)}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
