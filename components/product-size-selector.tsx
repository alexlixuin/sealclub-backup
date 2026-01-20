"use client"

import { useEffect, useMemo, useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { getSizeOptionById, normalizeSizeOptionForProduct } from "@/lib/products"
import AddToCartButton from "@/components/add-to-cart-button"
import { BacWaterCheckbox } from "@/components/bac-water-checkbox"
import { BacWaterProvider } from "@/components/bac-water-context"
import { SubscriptionOptions } from "@/components/subscription-options"
import { Badge } from "@/components/ui/badge"
import type { Product, SubscriptionOption } from "@/lib/products"

interface ProductSizeSelectorProps {
  product: Product
}

export default function ProductSizeSelector({ product }: ProductSizeSelectorProps) {
  const [selectedSizeId, setSelectedSizeId] = useState(
    product.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions[0].id : "",
  )
  const [isOneTime, setIsOneTime] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionOption | null>(null)

  const selectedSize = product.sizeOptions
    ? getSizeOptionById(product, selectedSizeId) || product.sizeOptions[0]
    : undefined

  const hasSubscriptionOptions = product.subscriptionOptions && product.subscriptionOptions.length > 0

  // Detect if the bulk option is selected (id convention or name match)
  const isBulkSelected = !!selectedSize && (
    selectedSize.id === "bulk-10" || /bulk\s*\(10\+\s*vials\)/i.test(selectedSize.name)
  )

  // Compute display price accounting for bulk enforcement
  const computedDisplayPrice = isOneTime
    ? (isBulkSelected
        ? (selectedSize?.price || product.price) * 10
        : (selectedSize?.price || product.price))
    : (selectedSubscription
        ? selectedSubscription.price
        : (isBulkSelected
            ? (selectedSize?.price || product.price) * 10
            : (selectedSize?.price || product.price)))

  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return null
  }

  const handleSizeChange = (value: string) => {
    setSelectedSizeId(value)
    // Reset subscription selection when size changes
    setSelectedSubscription(null)
  }

  const handleToggleSubscription = (isSubscription: boolean) => {
    setIsOneTime(!isSubscription)
    if (isSubscription) {
      // Auto-select first subscription option when switching to subscription
      if (product.subscriptionOptions && product.subscriptionOptions.length > 0) {
        setSelectedSubscription(product.subscriptionOptions[0])
      }
    } else {
      setSelectedSubscription(null)
    }
  }

  const handleSubscriptionChange = (subscription: SubscriptionOption | null) => {
    setSelectedSubscription(subscription)
  }

  const [stockOverride, setStockOverride] = useState<any>(null)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        const res = await fetch(`/api/stock-overrides?productId=${encodeURIComponent(product.id)}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json()
        if (!isActive) return
        setStockOverride(data?.override ?? null)
      } catch {
        // ignore
      }
    }

    load()
    const id = window.setInterval(load, 2000)
    return () => {
      isActive = false
      window.clearInterval(id)
    }
  }, [product.id])

  const hideStock = useMemo(() => !!stockOverride?.hideStock, [stockOverride])

  return (
    <BacWaterProvider>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Size Options</h3>
          <RadioGroup value={selectedSizeId} onValueChange={handleSizeChange} className="grid gap-2">
            {product.sizeOptions.map((option) => {
              const normalizedOption = normalizeSizeOptionForProduct(product, option)
              let domestic = !!(normalizedOption as any).instockDomestic
              let international = !!(normalizedOption as any).instockInternational

              if (typeof stockOverride?.domesticAll === "boolean") {
                domestic = stockOverride.domesticAll
              }
              if (typeof stockOverride?.internationalAll === "boolean") {
                international = stockOverride.internationalAll
              }

              const sizeOverride = stockOverride?.sizeOverrides?.[option.id]
              if (typeof sizeOverride?.domestic === "boolean") {
                domestic = sizeOverride.domestic
              }
              if (typeof sizeOverride?.international === "boolean") {
                international = sizeOverride.international
              }

              const optionInStock = domestic || international

              return (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} disabled={!optionInStock} />
                  <Label
                    htmlFor={option.id}
                    className={`flex justify-between w-full cursor-pointer ${!optionInStock ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span className="flex flex-col">
                      <span>{normalizedOption.name}</span>
                      {!hideStock && (
                        <span className="mt-1 flex gap-2">
                          <Badge
                            variant="secondary"
                            className={`h-5 px-2 text-xs ${domestic ? "bg-green-600/15 text-green-500 border border-green-500/30" : "bg-red-600/15 text-red-500 border border-red-500/30"}`}
                          >
                            Melbourne, Australia {domestic ? "(In stock)" : "Out"}
                          </Badge>
                          <Badge variant={international ? "default" : "secondary"} className="h-5 px-2 text-xs">
                            China Warehouse {international ? "(In stock)" : "Out"}
                          </Badge>
                        </span>
                      )}
                    </span>

                    <span className="flex flex-col items-end">
                      <span className="font-semibold">{formatCurrency(normalizedOption.price)}</span>
                      {!hideStock && !optionInStock && <span className="text-xs text-muted-foreground">Unavailable</span>}
                    </span>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-bold">
            {formatCurrency(computedDisplayPrice)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {selectedSize?.name || product.quantity}
            {!isOneTime && selectedSubscription && (
              <span className="text-primary ml-2">
                (Monthly Subscription - 10% off)
              </span>
            )}
          </p>
          {isBulkSelected && (
            <p className="text-xs text-muted-foreground mt-1">
              Bulk option enforces a fixed quantity of 10. Price shown = per-vial bulk price × 10.
            </p>
          )}
        </div>

        {hasSubscriptionOptions && (
          <SubscriptionOptions
            subscriptionOptions={product.subscriptionOptions || []}
            selectedSubscription={selectedSubscription}
            onSubscriptionChange={handleSubscriptionChange}
            selectedSize={selectedSize?.name || product.quantity}
            isOneTime={isOneTime}
            onToggleSubscription={handleToggleSubscription}
          />
        )}

        <BacWaterCheckbox productId={product.id} />
        
        <AddToCartButton 
          product={product} 
          selectedSize={selectedSize}
          isSubscription={!isOneTime}
          selectedSubscription={selectedSubscription}
          showQuantity={!isBulkSelected}
          fixedQuantity={isBulkSelected ? 10 : undefined}
        />
      </div>
    </BacWaterProvider>
  )
}
