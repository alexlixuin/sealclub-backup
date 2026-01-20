"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, AlertTriangle, Loader2, Users, Percent } from "lucide-react"

// Add the import for getSpecificProductImage
import { getSpecificProductImage, getProductById, getRelatedProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"

// Add a function to get the product image in the cart
const getCartItemImage = (id: string, image: string) => {
  const product = getProductById(id)
  if (product) {
    const productImage = getSpecificProductImage(product)
    // Return the product-specific image if available
    return productImage || image || "/images/logo-ozptides-transparent.png"
  }
  // Fallback to the provided image or a default
  return image || "/images/logo-ozptides-transparent.png"
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    clearCart,
    discount,
    setDiscount,
    discountAmount,
    affiliate,
    setAffiliate,
    total,
    shippingMethod,
    setShippingMethod,
    shippingCost,
    availableShippingMethods,
    protocolGuideSelected = false,
    setProtocolGuideSelected,
    protocolGuidePrice = 50,
    nasalSpraySelected = false,
    setNasalSpraySelected = () => {},
    nasalSprayPrice = 55,
  } = useCart()
  
  const handleNasalSprayToggle = (checked: boolean | "indeterminate") => {
    const value = !!checked
    if (typeof setNasalSpraySelected === "function") {
      setNasalSpraySelected(value)
    } else {
      console.warn("setNasalSpraySelected is not available yet")
    }
  }
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const finalTotal = total // Total already includes shipping cost from cart provider

  // Derive related products from items in the cart
  const relatedProducts = useMemo(() => {
    if (!items || items.length === 0) return [] as ReturnType<typeof getRelatedProducts>

    const inCartIds = new Set(items.map((i) => i.id))
    const collected: Record<string, boolean> = {}
    const result: ReturnType<typeof getRelatedProducts> = []

    for (const item of items) {
      const rel = getRelatedProducts(item.id)
      for (const p of rel) {
        if (inCartIds.has(p.id)) continue // skip items already in cart
        if (collected[p.id]) continue // de-duplicate
        collected[p.id] = true
        result.push(p)
      }
    }

    return result
  }, [items])

  const handleQuantityChange = (id: string, newQuantity: number, sizeId?: string) => {
    // Enforce minimum quantity of 10 for bulk items
    const cartItem = items.find((i) => i.id === id && i.sizeId === sizeId)
    const minQty = cartItem?.sizeId === 'bulk-10' ? 10 : 1
    if (newQuantity < minQty) return
    if (newQuantity > 10) return
    updateQuantity(id, newQuantity, sizeId)
  }

  const handleRemoveItem = (id: string, sizeId?: string) => {
    removeItem(id, sizeId)
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code")
      return
    }

    setIsApplyingPromo(true)
    setPromoError("")

    try {
      const response = await fetch("/api/codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          subtotal,
        }),
      })

      const data = await response.json()

      if (data.isValid) {
        if (data.type === "discount") {
          // Handle regular discount code
          setDiscount({
            code: data.discount.code,
            type: data.discount.type,
            value: data.discount.value,
            amountSaved: data.discountAmount,
          })

          toast({
            title: "Discount code applied",
            description: `${data.discount.code} discount has been applied to your cart.`,
          })
        } else if (data.type === "affiliate") {
          // Handle affiliate code
          setAffiliate({
            code: data.affiliateCode.code,
            affiliateName: data.affiliateCode.affiliate.name,
            commissionRate: data.affiliateCode.affiliate.commission_rate,
            discountPercentage: data.affiliateCode.discount_percentage,
            amountSaved: data.discountAmount,
            affiliateId: data.affiliateInfo.affiliateId,
            affiliateCodeId: data.affiliateInfo.affiliateCodeId,
          })

          toast({
            title: "Affiliate code applied",
            description: `${data.affiliateCode.code} affiliate code has been applied. Supporting ${data.affiliateCode.affiliate.name}!`,
          })
        } else if (data.type === "sms") {
          // Handle SMS discount code
          setDiscount({
            code: data.smsCode.code,
            type: "percentage",
            value: data.smsCode.discount_percentage,
            amountSaved: 0, // Let cart provider calculate dynamically
          })

          toast({
            title: "SMS discount applied",
            description: `${data.smsCode.discount_percentage}% SMS discount has been applied to your cart.`,
          })
        }

        setPromoCode("")
      } else {
        setPromoError(data.error || "Invalid code")
        toast({
          title: "Invalid code",
          description: data.error || "The code you entered is invalid or has expired.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error applying code:", error)
      setPromoError("An error occurred while applying the code")
      toast({
        title: "Error",
        description: "An error occurred while applying the code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemoveDiscount = () => {
    setDiscount(null)
    toast({
      title: "Discount code removed",
      description: "The discount code has been removed from your cart.",
    })
  }

  const handleRemoveAffiliate = () => {
    setAffiliate(null)
    toast({
      title: "Affiliate code removed",
      description: "The affiliate code has been removed from your cart.",
    })
  }

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      })
      return
    }

    if (!termsAccepted) {
      toast({
        title: "Terms and Service Required",
        description: "Please agree to the terms and service before proceeding.",
        variant: "destructive",
      })
      return
    }

    router.push("/checkout")
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">Your Cart</h1>
          {items.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative mb-8">
              <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gray-800 rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-xs font-medium text-gray-400">0</span>
              </div>
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Your cart is empty</h2>
              <p className="text-gray-400 leading-relaxed">
                Discover our premium research chemicals and add them to your cart to get started.
              </p>
              <div className="pt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3 text-base font-medium bg-primary hover:bg-primary/90"
                >
                  <Link href="/">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border border-gray-800 bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl flex items-center justify-between text-white">
                    <span>Cart Items</span>
                    <span className="text-sm font-normal text-gray-400">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${item.sizeId || index}`} className="group">
                      <div className="flex gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 transition-all duration-200 group-hover:border-primary/30 group-hover:bg-gray-800/80">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-gray-700/30 flex-shrink-0 border border-gray-600/30">
                          <Image
                            src={getCartItemImage(item.id, item.image) || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            sizes="(max-width: 768px) 80px, 96px"
                          />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="font-medium text-base sm:text-lg leading-tight text-white">
                                <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                                  {item.name}
                                </Link>
                              </h3>
                              {item.variant && <p className="text-sm text-gray-400 mt-1">Size: {item.variant}</p>}
                            </div>
                            <p className="font-semibold text-lg text-primary">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800/50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-l-lg hover:bg-primary/20 text-gray-300 hover:text-white"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.sizeId)}
                                disabled={item.quantity <= (item.sizeId === 'bulk-10' ? 10 : 1)}
                              >
                                <Minus className="h-4 w-4" />
                                <span className="sr-only">Decrease quantity</span>
                              </Button>
                              <span className="w-12 text-center text-base font-medium text-white">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-r-lg hover:bg-primary/20 text-gray-300 hover:text-white"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.sizeId)}
                                disabled={item.quantity >= 10}
                              >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Increase quantity</span>
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 px-3 py-2 h-9"
                              onClick={() => handleRemoveItem(item.id, item.sizeId)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Clear Cart
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Related products */}
              {relatedProducts.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Browse related products</h2>
                    <Link href="/" className="text-sm text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {relatedProducts.slice(0, 8).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="shadow-xl border border-gray-800 bg-gray-900/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center text-white">
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
                    </div>

                    {/* Display discount if applied */}
                    {discount && (
                      <div className="flex justify-between text-base text-green-400">
                        <span>Discount ({discount.code})</span>
                        <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}

                    {/* Display affiliate discount if applied */}
                    {affiliate && affiliate.amountSaved > 0 && (
                      <div className="flex justify-between text-base text-blue-400">
                        <span>Affiliate Discount ({affiliate.code})</span>
                        <span className="font-medium">-{formatCurrency(affiliate.amountSaved)}</span>
                      </div>
                    )}

                    {/* Nasal Spray line item */}
                    <div className="flex items-start justify-between text-base">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <Checkbox
                          checked={nasalSpraySelected}
                          onCheckedChange={handleNasalSprayToggle}
                          className="mt-0.5 border-gray-600 data-[state=checked]:bg-primary"
                        />
                        <div className="text-gray-300">
                          <div className="font-medium text-white">Add Nasal Spray Form</div>
                          <div className="text-xs text-gray-400">Live support for more details (e.g. dosage)</div>
                        </div>
                      </label>
                      <span className="font-medium text-white">{formatCurrency(nasalSprayPrice)}</span>
                    </div>

                    {/* Protocol Guide line item */}
                    <div className="flex items-start justify-between text-base">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <Checkbox
                          checked={protocolGuideSelected}
                          onCheckedChange={(checked) => setProtocolGuideSelected(!!checked)}
                          className="mt-0.5 border-gray-600 data-[state=checked]:bg-primary"
                        />
                        <div className="text-gray-300">
                          <div className="font-medium text-white">Add Protocol Guide (PDF)</div>
                          <div className="text-xs text-gray-400">
                            Covers: {items.map((i) => i.name).join(", ") || "your selected items"}
                          </div>
                        </div>
                      </label>
                      <span className="font-medium text-white">{formatCurrency(protocolGuidePrice)}</span>
                    </div>

                    <Separator className="bg-gray-700" />
                  </div>

                  {/* Applied codes section */}
                  {(discount || affiliate) && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">Applied Codes</p>

                      {/* Discount code display */}
                      {discount && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-900/20 border-green-700">
                          <div className="flex items-center">
                            <Percent className="h-4 w-4 mr-3 text-green-400" />
                            <div>
                              <span className="font-medium text-green-400">{discount.code}</span>
                              <span className="ml-2 text-xs text-green-500">
                                (
                                {discount.type === "percentage" ? `${discount.value}%` : formatCurrency(discount.value)}{" "}
                                off)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveDiscount}
                            className="h-8 px-2 hover:bg-green-800/30 text-green-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove discount code</span>
                          </Button>
                        </div>
                      )}

                      {/* Affiliate code display */}
                      {affiliate && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-900/20 border-blue-700">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-3 text-blue-400" />
                            <div>
                              <span className="font-medium text-blue-400">{affiliate.code}</span>
                              <div className="text-xs text-blue-500">
                                <div>Partner: {affiliate.affiliateName}</div>
                                <div>Discount: {affiliate.discountPercentage}%</div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAffiliate}
                            className="h-8 px-2 hover:bg-blue-800/30 text-blue-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove affiliate code</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Promo code input section */}
                  {!discount && !affiliate && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">Promo/Affiliate Code</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleApplyPromo()
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyPromo}
                          disabled={!promoCode || isApplyingPromo}
                          className="px-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                      {promoError && <p className="text-xs text-red-400">{promoError}</p>}
                    </div>
                  )}

                  {/* Add another code section */}
                  {(discount || affiliate) && !(discount && affiliate) && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">
                        {discount ? "Add Affiliate Code" : "Add Discount Code"}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder={discount ? "Enter affiliate code" : "Enter discount code"}
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleApplyPromo()
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyPromo}
                          disabled={!promoCode || isApplyingPromo}
                          className="px-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                      {promoError && <p className="text-xs text-red-400">{promoError}</p>}
                    </div>
                  )}

                  <Separator className="bg-gray-700" />

                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>

                  <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 p-4 rounded-lg border border-red-700/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300 leading-relaxed">
                        By proceeding to checkout, you confirm that all products are for research purposes only and not
                        for human consumption.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-3">
                    <Checkbox
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-primary"
                    />
                    <label className="text-sm text-gray-300 cursor-pointer select-none" onClick={() => setTermsAccepted(!termsAccepted)}>
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline" target="_blank">
                        terms and service, refund policy, privacy policy, and shipping policy.
                      </Link>
                    </label>
                  </div>

                  <Button
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleProceedToCheckout}
                    disabled={!termsAccepted}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
