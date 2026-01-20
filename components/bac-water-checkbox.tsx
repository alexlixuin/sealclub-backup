'use client'

import { useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { getProductById } from "@/lib/products"
import { useBacWater } from "@/components/bac-water-context"
import { Droplets } from "lucide-react"

interface BacWaterCheckboxProps {
  productId: string
}

export function BacWaterCheckbox({ productId }: BacWaterCheckboxProps) {
  const { includeBacWater, setIncludeBacWater } = useBacWater()
  const { items } = useCart()

  const bacWaterProduct = getProductById("bacteriostatic-water")
  
  // Check if BAC water is already in cart
  const bacWaterInCart = items.some(item => item.id.includes("bacteriostatic-water"))

  // Remove all useEffect logic - no automatic behavior

  const handleCheckboxChange = (checked: boolean) => {
    setIncludeBacWater(checked)
    // Only track state - don't add/remove from cart immediately
  }

  // Don't show if BAC water product doesn't exist or if it's the BAC water product page itself
  if (!bacWaterProduct || productId === "bacteriostatic-water") {
    return null
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-card border rounded-lg">
      <Checkbox
        id="include-bac-water"
        checked={includeBacWater || bacWaterInCart}
        onCheckedChange={handleCheckboxChange}
        disabled={bacWaterInCart}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex items-center space-x-2 flex-1">
        <Droplets className="h-4 w-4 text-muted-foreground" />
        <Label 
          htmlFor="include-bac-water" 
          className="text-sm font-medium cursor-pointer flex-1 text-foreground"
        >
          Include Bacteriostatic Water
          {bacWaterInCart && (
            <span className="text-xs text-muted-foreground ml-2">(Already in cart)</span>
          )}
        </Label>
      </div>
    </div>
  )
}
