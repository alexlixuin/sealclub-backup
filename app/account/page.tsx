"use client"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientSafe } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Package, MapPin, Truck, Calendar, DollarSign, Plus, Edit, Trash2, Newspaper, AlertCircle, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { formatCurrency } from "@/lib/utils"

type UserProfile = {
  id: string
  full_name: string | null
  phone: string | null
  store_credit: number
  created_at: string
  updated_at: string
}

type UserAddress = {
  id: string
  user_id: string
  type: "shipping" | "billing"
  first_name: string
  last_name: string
  company: string | null
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

type OrderWithTracking = {
  id: string
  order_number: number
  customer_email: string
  customer_name: string
  total_amount: number
  items: any
  shipping_info: any
  billing_info: any
  payment_status: string
  is_test_order: boolean
  created_at: string
  tracking?: {
    tracking_number: string | null
    carrier: string | null
    status: string
    notes: string | null
  }
  unverified?: boolean
  verificationMode?: string
  metadata?: any
}

type StoreCreditTransaction = {
  id: string
  user_id: string
  transaction_type: "credit_added" | "credit_used" | "credit_refunded"
  amount: number
  balance_after: number
  created_at: string
  notes: string | null
}

export default function AccountPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const supabase = createClientSafe()
    let unsubscribe: (() => void) | undefined

    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        console.error("[v0] Error getting user:", err)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }

      // React to auth changes (e.g., sign-in via Checkout modal)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("[v0] /account auth state:", event)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      unsubscribe = () => subscription.unsubscribe()
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const supabase = createClientSafe()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Successfully signed in!")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("An unexpected error occurred during login")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const phone = formData.get("phone") as string

    console.log("[v0] Starting signup process", { email, fullName, phone })

    try {
      const supabase = createClientSafe()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })

      console.log("[v0] Signup response", { data, error })

      if (error) {
        console.error("[v0] Signup error:", error)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log("[v0] User created successfully, creating profile", { userId: data.user.id })

        // Wait a moment for the auth state to settle
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const { error: profileError } = await supabase.from("user_profiles").insert({
          id: data.user.id,
          full_name: fullName,
          phone: phone,
        })

        if (profileError) {
          console.error("[v0] Profile creation error:", {
            error: profileError,
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            userId: data.user.id,
            authUid: (await supabase.auth.getUser()).data.user?.id,
          })
          setError(`Profile creation failed: ${profileError.message}`)
        } else {
          console.log("[v0] Profile created successfully")
          setSuccess("Account created successfully! Please check your email to verify your account.")
        }
      }
    } catch (err) {
      console.error("[v0] Unexpected signup error:", err)
      setError("An unexpected error occurred during signup")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClientSafe()
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Successfully signed out!")
        router.push("/")
      }
    } catch (err) {
      console.error("[v0] Sign out error:", err)
      setError("An unexpected error occurred during sign out")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If user is logged in, show account dashboard
  if (user) {
    return <AccountDashboard user={user} onSignOut={handleSignOut} />
  }

  // Show login/signup form
  return (
    <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Sign in to your account or create a new one</p>
        </div>

        <Card className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardHeader className="px-4 sm:px-6 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
                <TabsTrigger value="login" className="text-sm sm:text-base">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="login-email" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="Enter your email"
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      className="h-11 text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base mt-6" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      name="fullName" 
                      type="text" 
                      required 
                      placeholder="Enter your full name"
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="signup-email" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="Enter your email"
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-sm font-medium">Phone</Label>
                    <Input 
                      id="signup-phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="Enter your phone number"
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      placeholder="Create a password"
                      minLength={6}
                      className="h-11 text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base mt-6" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const AccountDashboard = ({ user, onSignOut }: { user: SupabaseUser; onSignOut: () => void }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"account" | "orders" | "store_credit" | "news">("account")
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [storeCreditTransactions, setStoreCreditTransactions] = useState<StoreCreditTransaction[]>([])

  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user?.id])

  const loadUserData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading user data for:", user.id)

      const supabase = createClientSafe()

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id) // Changed back from "user_id" to "id"
        .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

      console.log("[v0] Profile query result:", { profileData, profileError })

      if (profileError) {
        console.error("[v0] Profile error:", profileError)
      } else {
        setProfile(profileData)
      }

      // Load user addresses
      const { data: addressData, error: addressError } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Address query result:", { addressData, addressError })

      if (addressError) {
        console.error("[v0] Address error:", addressError)
      } else {
        setAddresses(addressData || [])
      }

      if (user.email) {
        await loadVerifiedOrders(user.email)
      }

      // Load store credit transactions
      const { data: storeCreditData, error: storeCreditError } = await supabase
        .from("store_credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Store credit query result:", { storeCreditData, storeCreditError })

      if (storeCreditError) {
        console.error("[v0] Store credit error:", storeCreditError)
      } else {
        setStoreCreditTransactions(storeCreditData || [])
      }
    } catch (err) {
      console.error("[v0] Error loading user data:", err)
      setError("Failed to load account data")
    } finally {
      setLoading(false)
    }
  }

  const refreshOrders = async () => {
    if (!user.email || isLoadingOrders) return

    setIsLoadingOrders(true)
    try {
      await loadVerifiedOrders(user.email)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const loadVerifiedOrders = async (userEmail: string) => {
    if (isLoadingOrders) {
      console.log("[v0] Order verification already in progress, skipping...")
      return
    }

    try {
      console.log("[v0] === STARTING ORDER VERIFICATION PROCESS ===")
      console.log("[v0] Loading orders for email:", userEmail)
      console.log("[v0] Timestamp:", new Date().toISOString())

      const supabase = createClientSafe()

      console.log("[v0] Step 1: Querying order_logs table...")
      const { data: orderData, error: orderError } = await supabase
        .from("order_logs")
        .select(`
          *,
          order_tracking (
            tracking_number,
            carrier,
            status,
            notes
          )
        `)
        .eq("customer_email", userEmail)
        .order("created_at", { ascending: false })

      console.log("[v0] Order query result:", {
        orderCount: orderData?.length || 0,
        orderData: orderData?.map((o) => ({
          order_number: o.order_number,
          session_id: o.session_id,
          total: o.total,
          created_at: o.created_at,
        })),
        orderError,
      })

      if (orderError) {
        console.error("[v0] ❌ Order query failed:", orderError)
        setError("Failed to load orders from database")
        return
      }

      if (!orderData || orderData.length === 0) {
        console.log("[v0] ℹ️ No orders found for email:", userEmail)
        setOrders([])
        return
      }

      console.log("[v0] ✅ Found", orderData.length, "orders in database")
      console.log("[v0] Step 2: Starting Stripe verification process...")

      // Step 2: Verify each order against Stripe (both live and test mode)
      const verifiedOrders: OrderWithTracking[] = []
      let verificationCount = 0

      for (const order of orderData) {
        verificationCount++
        console.log(`[v0] === VERIFYING ORDER ${verificationCount}/${orderData.length} ===`)
        console.log("[v0] Order Number:", order.order_number)
        console.log("[v0] Session ID:", order.session_id)
        console.log("[v0] Order Total:", order.total)
        console.log("[v0] Order Date:", order.created_at)

        if (!order.session_id) {
          console.log("[v0] ⚠️ Order", order.order_number, "has no session_id, skipping Stripe verification")
          continue
        }

        try {
          console.log("[v0] 🔄 Calling verification API endpoint...")
          const verificationResponse = await fetch("/api/verify-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: order.session_id,
              customerEmail: userEmail,
              orderNumber: order.order_number,
            }),
          })

          console.log("[v0] API Response Status:", verificationResponse.status)

          if (!verificationResponse.ok) {
            console.error("[v0] ❌ API request failed with status:", verificationResponse.status)
            throw new Error(`API request failed: ${verificationResponse.status}`)
          }

          const verificationResult = await verificationResponse.json()
          console.log("[v0] 📋 Verification result for order", order.order_number, ":", {
            verified: verificationResult.verified,
            mode: verificationResult.mode,
            reason: verificationResult.reason,
            stripeData: verificationResult.stripeData ? "Present" : "Missing",
          })

          if (verificationResult.verified) {
            console.log(
              "[v0] ✅ Order",
              order.order_number,
              "verified successfully in",
              verificationResult.mode,
              "mode",
            )
            const orderWithTracking = {
              ...order,
              tracking: order.order_tracking?.[0] || null,
              verificationMode: verificationResult.mode, // Add verification mode info
            }
            verifiedOrders.push(orderWithTracking)
          } else {
            console.log("[v0] ❌ Order", order.order_number, "failed verification:", verificationResult.reason)
          }
        } catch (verifyError) {
          console.error("[v0] 💥 Error verifying order", order.order_number, ":", verifyError)
          // If verification fails, we'll still show the order but mark it as unverified
          console.log("[v0] ⚠️ Adding unverified order", order.order_number, "to list")
          const orderWithTracking = {
            ...order,
            tracking: order.order_tracking?.[0] || null,
            unverified: true, // Add flag to indicate unverified status
          }
          verifiedOrders.push(orderWithTracking)
        }
      }

      console.log("[v0] === VERIFICATION PROCESS COMPLETE ===")
      console.log("[v0] Total orders processed:", orderData.length)
      console.log("[v0] Verified orders count:", verifiedOrders.filter((o) => !o.unverified).length)
      console.log("[v0] Unverified orders count:", verifiedOrders.filter((o) => o.unverified).length)
      console.log("[v0] Final orders to display:", verifiedOrders.length)

      setOrders(verifiedOrders)
    } catch (err) {
      console.error("[v0] 💥 Critical error in loadVerifiedOrders:", err)
      setError("Failed to load order history")
    }
  }

  const saveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const addressData = {
      user_id: user.id,
      type: formData.get("type") as "shipping" | "billing",
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      company: (formData.get("company") as string) || null,
      address_line_1: formData.get("addressLine1") as string,
      address_line_2: (formData.get("addressLine2") as string) || null,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postal_code: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      is_default: formData.get("isDefault") === "on",
    }

    console.log("[v0] Saving address:", addressData)

    try {
      const supabase = createClientSafe()
      if (editingAddress) {
        const { error } = await supabase.from("user_addresses").update(addressData).eq("id", editingAddress.id)

        if (error) throw error
        setSuccess("Address updated successfully!")
      } else {
        const { error } = await supabase.from("user_addresses").insert(addressData)

        if (error) throw error
        setSuccess("Address added successfully!")
      }

      setShowAddressDialog(false)
      setEditingAddress(null)
      loadUserData()
    } catch (err: any) {
      console.error("[v0] Address save error:", err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAddress = async (addressId: string) => {
    console.log("[v0] Deleting address:", addressId)

    try {
      const supabase = createClientSafe()
      const { error } = await supabase.from("user_addresses").delete().eq("id", addressId)

      if (error) throw error

      setSuccess("Address deleted successfully!")
      loadUserData()
    } catch (err: any) {
      console.error("[v0] Address delete error:", err)
      setError(err.message)
    }
  }

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("fullName") as string
    const phone = formData.get("phone") as string

    try {
      const supabase = createClientSafe()
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: fullName,
        phone: phone,
      })

      if (error) throw error

      setSuccess("Profile updated successfully!")
      loadUserData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount)
  }

  // Helper to safely render address data that may be flat or nested (e.g. Stripe-style)
  const AddressBlock = ({
    info,
    emptyText = "Information not available",
  }: {
    info: any
    emptyText?: string
  }) => {
    // Utility to coerce values to safe display strings
    const s = (v: any): string => (typeof v === "string" || typeof v === "number" ? String(v) : "")

    if (!info || typeof info !== "object") {
      return <p className="text-muted-foreground">{emptyText}</p>
    }

    // Some payloads store address fields flat; others nest under `address`.
    // Sometimes address.address is itself an object; handle those cases carefully.
    const addr = typeof info.address === "object" && info.address !== null ? info.address : null
    const addrInner = addr && typeof (addr as any).address === "object" ? (addr as any).address : null

    const firstName = s(info.firstName) || s(info.first_name) || s(info.name?.split?.(" ")[0])
    const lastName = s(info.lastName) || s(info.last_name) || s(info.name?.split?.(" ").slice(1).join(" "))

    const line1 =
      s(addr?.line1) ||
      s(addrInner?.line1) ||
      s(addrInner?.addressLine1) ||
      s(addrInner?.address) ||
      s((addr as any)?.address) ||
      s(info.address) ||
      s(info.address_line_1)

    const line2 = s(addr?.line2) || s(addrInner?.line2) || s(info.address2) || s(info.address_line_2)
    const city = s(addr?.city) || s(addrInner?.city) || s(info.city)
    const state = s(addr?.state) || s(addrInner?.state) || s(info.state)
    const postal =
      s((addr as any)?.postal_code) ||
      s((addr as any)?.zipCode) ||
      s(addrInner?.postal_code) ||
      s(addrInner?.zipCode) ||
      s(info.postalCode) ||
      s(info.postal_code) ||
      s((info as any).zipCode)
    const country = s(addr?.country) || s(addrInner?.country) || s(info.country)
    const phone = s(info.phone) || s((info as any).phone_number)

    const hasAny = firstName || lastName || line1 || line2 || city || state || postal || country || phone

    if (!hasAny) return <p className="text-muted-foreground">{emptyText}</p>

    return (
      <>
        {(firstName || lastName) && (
          <p>
            {firstName} {lastName}
          </p>
        )}
        {line1 && <p>{line1}</p>}
        {line2 && <p>{line2}</p>}
        {(city || state || postal) && (
          <p>
            {city}
            {city && (state || postal) ? ", " : ""}
            {state} {postal}
          </p>
        )}
        {country && <p>{country}</p>}
        {phone && (
          <p>
            <span className="font-medium">Phone:</span> {phone}
          </p>
        )}
      </>
    )
  }

  // Helper function to extract tracking code from metadata
  const extractTrackingFromMetadata = (metadata: any): string | null => {
    try {
      if (!metadata) return null

      // If metadata is a string, parse it as JSON
      const metadataObj = typeof metadata === "string" ? JSON.parse(metadata) : metadata

      // Look for trackingCode in various possible locations
      return (
        metadataObj?.trackingCode ||
        metadataObj?.tracking_code ||
        metadataObj?.tracking?.code ||
        metadataObj?.shipping?.trackingCode ||
        null
      )
    } catch (error) {
      console.log("[v0] Error parsing metadata for tracking:", error)
      return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "account" | "orders" | "store_credit" | "news")}
        >
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account Information
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders & Tracking
            </TabsTrigger>
            <TabsTrigger value="store_credit" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Store Credit
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News & Information
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <div className="grid gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          defaultValue={profile?.full_name || ""}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email || ""} disabled className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          defaultValue={profile?.phone || ""}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Saved Addresses</CardTitle>
                      <CardDescription>Manage your shipping and billing addresses</CardDescription>
                    </div>
                    <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingAddress(null)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                          <DialogDescription>
                            {editingAddress
                              ? "Update your address information"
                              : "Add a new shipping or billing address"}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={saveAddress} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="type">Address Type</Label>
                              <Select name="type" defaultValue={editingAddress?.type || "shipping"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="shipping">Shipping</SelectItem>
                                  <SelectItem value="billing">Billing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                defaultValue={editingAddress?.first_name || ""}
                                required
                                placeholder="First name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                defaultValue={editingAddress?.last_name || ""}
                                required
                                placeholder="Last name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company">Company (Optional)</Label>
                              <Input
                                id="company"
                                name="company"
                                defaultValue={editingAddress?.company || ""}
                                placeholder="Company name"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="addressLine1">Address Line 1</Label>
                              <Input
                                id="addressLine1"
                                name="addressLine1"
                                defaultValue={editingAddress?.address_line_1 || ""}
                                required
                                placeholder="Street address"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                              <Input
                                id="addressLine2"
                                name="addressLine2"
                                defaultValue={editingAddress?.address_line_2 || ""}
                                placeholder="Apartment, suite, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                name="city"
                                defaultValue={editingAddress?.city || ""}
                                required
                                placeholder="City"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                name="state"
                                defaultValue={editingAddress?.state || ""}
                                required
                                placeholder="State"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="postalCode">Postal Code</Label>
                              <Input
                                id="postalCode"
                                name="postalCode"
                                defaultValue={editingAddress?.postal_code || ""}
                                required
                                placeholder="Postal code"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">Country</Label>
                              <Select name="country" defaultValue={editingAddress?.country || "Australia"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isDefault"
                              name="isDefault"
                              defaultChecked={editingAddress?.is_default || false}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isDefault">Set as default address</Label>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                              {saving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : editingAddress ? (
                                "Update Address"
                              ) : (
                                "Add Address"
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <p className="text-muted-foreground">
                      No saved addresses yet. Add an address to make checkout faster.
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={address.type === "shipping" ? "default" : "secondary"}>
                                {address.type === "shipping" ? "Shipping" : "Billing"}
                              </Badge>
                              {address.is_default && <Badge variant="outline">Default</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAddress(address)
                                  setShowAddressDialog(true)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteAddress(address.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="font-medium">
                              {address.first_name} {address.last_name}
                            </p>
                            {address.company && <p>{address.company}</p>}
                            <p>{address.address_line_1}</p>
                            {address.address_line_2 && <p>{address.address_line_2}</p>}
                            <p>
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View your past orders and track shipments (includes both live and test orders)
                    </CardDescription>
                  </div>
                  <Button onClick={refreshOrders} disabled={loading} variant="outline">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      "Refresh Orders"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading and verifying orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground">
                    No verified orders found. Start shopping to see your orders here!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">Order #{order.order_number}</h4>
                              {order.unverified && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                  Unverified
                                </span>
                              )}
                              {order.verificationMode && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    order.verificationMode === "test"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {order.verificationMode === "test" ? "Test Mode" : "Live Mode"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatCurrency(order.total_amount)}
                            </p>
                            <div className="flex gap-1 text-sm">
                              <Badge variant={order.is_test_order ? "secondary" : "default"} className="text-xs">
                                {order.is_test_order ? "Test Order" : "Live Order"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid md:grid-cols-4 gap-6">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Items
                            </h4>
                            <div className="space-y-2">
                              {Array.isArray(order.items) ? (
                                order.items.map((item: any, index: number) => (
                                  <div key={index} className="text-sm">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">
                                      Qty: {item.quantity} × {formatCurrency(item.price)}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">Items information not available</p>
                              )}
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Shipping Address
                            </h4>
                            <div className="text-sm space-y-1">
                              <AddressBlock info={order.shipping_info} emptyText="Shipping information not available" />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Billing Address
                            </h4>
                            <div className="text-sm space-y-1">
                              <AddressBlock info={order.billing_info} emptyText="Billing information not available" />
                            </div>
                          </div>

                          {/* Tracking Info */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Tracking
                            </h4>
                            <div className="text-sm space-y-1">
                              {(() => {
                                const metadataTrackingCode = extractTrackingFromMetadata(order.metadata)
                                const hasTrackingInfo = metadataTrackingCode || order.tracking?.tracking_number

                                if (hasTrackingInfo) {
                                  return (
                                    <>
                                      <p>
                                        <span className="font-medium">Tracking:</span>{" "}
                                        {metadataTrackingCode || order.tracking?.tracking_number}
                                      </p>
                                      {order.tracking?.carrier && (
                                        <p>
                                          <span className="font-medium">Carrier:</span> {order.tracking.carrier}
                                        </p>
                                      )}
                                      {order.tracking?.notes && (
                                        <p>
                                          <span className="font-medium">Notes:</span> {order.tracking.notes}
                                        </p>
                                      )}
                                      {metadataTrackingCode && (
                                        <p className="text-xs text-blue-600">Order has been dispatched</p>
                                      )}
                                    </>
                                  )
                                } else {
                                  return (
                                    <p className="text-muted-foreground">
                                      Tracking information will be available once shipped
                                    </p>
                                  )
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store_credit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Credit</CardTitle>
                <CardDescription>
                  View your store credit balance and transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Store Credit Balance</h4>
                    <p className="text-lg font-bold">
                      {formatCurrency(profile?.store_credit || 0)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Transaction History</h4>
                    <div className="space-y-2">
                      {storeCreditTransactions.length === 0 ? (
                        <p className="text-muted-foreground">
                          No store credit transactions yet.
                        </p>
                      ) : (
                        storeCreditTransactions.map((transaction, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">
                                  {transaction.transaction_type === "credit_added"
                                    ? "Credit Added"
                                    : transaction.transaction_type === "credit_used"
                                    ? "Credit Used"
                                    : "Credit Refunded"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Balance: {formatCurrency(transaction.balance_after)}
                                </p>
                              </div>
                            </div>
                            {transaction.notes && (
                              <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <NewsContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const NewsContent = () => {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news")
        const data = await response.json()

        if (response.ok) {
          setNews(data.news || [])
        } else {
          setError("Failed to fetch news")
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        setError("Failed to fetch news")
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/20 text-red-300 border-red-500/30"
      case "high": return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "normal": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "low": return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      default: return "bg-blue-500/20 text-blue-300 border-blue-500/30"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return "🚨"
      case "high": return "⚠️"
      case "normal": return "📢"
      case "low": return "ℹ️"
      default: return "📢"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-400">Loading news...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-500/30 bg-red-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-300">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No news available</h3>
        <p className="text-gray-400">
          Check back later for updates and announcements.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {news.map((item, index) => (
        <div
          key={item.id}
          className="relative p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
        >
          {/* Priority indicator */}
          <div className="absolute top-4 right-4">
            <Badge className={`${getPriorityColor(item.priority)} flex items-center gap-1 text-xs`}>
              <span>{getPriorityIcon(item.priority)}</span>
              {item.priority}
            </Badge>
          </div>

          <div className="pr-20">
            <h3 className="text-xl font-semibold text-white mb-3">
              {item.title}
            </h3>

            {item.excerpt && (
              <p className="text-gray-300 mb-4 leading-relaxed">
                {item.excerpt}
              </p>
            )}

            <div className="prose prose-invert max-w-none mb-4">
              <div className="text-gray-300 whitespace-pre-wrap">
                {item.content}
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Tag className="h-4 w-4 text-gray-400" />
                {item.tags.map((tag: string, tagIndex: number) => (
                  <Badge
                    key={tagIndex}
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-300 bg-gray-800/50"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Date */}
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
