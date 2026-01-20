"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Minus, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useBacWater } from "@/components/bac-water-context"
import { getProductById, getSpecificProductImage } from "@/lib/products"
import type { Product, SizeOption, SubscriptionOption } from "@/lib/products"

interface AddToCartButtonProps {
  product: Product
  selectedSize?: SizeOption
  showQuantity?: boolean
  className?: string
  isSubscription?: boolean
  selectedSubscription?: SubscriptionOption | null
  fixedQuantity?: number
  priceOverride?: number
}

// Export as both named and default export for compatibility
export function AddToCartButton({ product, selectedSize, showQuantity = true, className = "", isSubscription = false, selectedSubscription = null, fixedQuantity, priceOverride }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(fixedQuantity ?? 1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()
  
  // Get BAC water context (now safe with default fallback)
  const { includeBacWater } = useBacWater()

  const handleAddToCart = () => {
    setIsAdding(true)

    // Get the product image URL
    let imageUrl = getSpecificProductImage(product) || product.image

    // If it's a relative path, make sure it's properly formatted
    if (imageUrl.startsWith("/")) {
      imageUrl = imageUrl // Keep as is, we'll handle it in createOrder
    }

    const finalQuantity = fixedQuantity ?? quantity

    const computedPrice = priceOverride !== undefined
      ? priceOverride
      : (isSubscription && selectedSubscription 
          ? selectedSubscription.price 
          : selectedSize ? selectedSize.price : product.price)

    // Add the main product
    addItem({
      id: product.id,
      name: product.name,
      price: computedPrice,
      image: imageUrl,
      quantity: finalQuantity,
      variant: selectedSize ? selectedSize.name : undefined,
      sizeId: selectedSize ? selectedSize.id : undefined,
      isSubscription: isSubscription,
      subscriptionInterval: isSubscription && selectedSubscription ? selectedSubscription.interval : undefined,
      subscriptionIntervalCount: isSubscription && selectedSubscription ? selectedSubscription.intervalCount : undefined,
    })

    // Add BAC water if checkbox is checked and it's not the BAC water product itself
    if (includeBacWater && product.id !== "bacteriostatic-water") {
      const bacWaterProduct = getProductById("bacteriostatic-water")
      if (bacWaterProduct) {
        const selectedBacSize = bacWaterProduct.sizeOptions?.[0]
        addItem({
          id: `${bacWaterProduct.id}-${selectedBacSize?.id || 'default'}`,
          name: bacWaterProduct.name,
          price: selectedBacSize?.price || bacWaterProduct.price,
          image: getSpecificProductImage(bacWaterProduct) || bacWaterProduct.image,
          quantity: 1,
          variant: selectedBacSize?.name,
          sizeId: selectedBacSize?.id,
        })
      }
    }

    // Reset after animation
    setTimeout(() => {
      setIsAdding(false)
    }, 1500)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {showQuantity && (
        <div className="flex items-center">
          <span className="text-sm mr-3">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={incrementQuantity}
              disabled={quantity >= 10}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
        </div>
      )}
      <Button onClick={handleAddToCart} className="w-full transition-all" disabled={isAdding}>
        {isAdding ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            {isSubscription ? "Added to Subscription" : "Added to Cart"}
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isSubscription ? "Subscribe Now" : "Add to Cart"}
          </>
        )}
      </Button>
    </div>
  )
}

// Also export as default for backward compatibility
export default AddToCartButton
