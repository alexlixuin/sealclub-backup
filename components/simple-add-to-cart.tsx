'use client'

import AddToCartButton from "@/components/add-to-cart-button"
import { BacWaterCheckbox } from "@/components/bac-water-checkbox"
import { BacWaterProvider } from "@/components/bac-water-context"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/products"

interface SimpleAddToCartProps {
  product: Product
}

export function SimpleAddToCart({ product }: SimpleAddToCartProps) {
  return (
    <BacWaterProvider>
      <div className="space-y-4">
        <div className="mt-4">
          <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
          <p className="text-sm text-muted-foreground mt-1">Quantity: {product.quantity}</p>
        </div>

        <BacWaterCheckbox productId={product.id} />
        
        <AddToCartButton product={product} />
      </div>
    </BacWaterProvider>
  )
}
