"use client"

import { useState, useEffect } from "react"
import { X, Truck, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CheckoutShippingNotificationProps {
  isVisible: boolean
  onDismiss: () => void
  amountNeeded: number
  isOceania: boolean
  threshold: number
}

export function CheckoutShippingNotification({ 
  isVisible, 
  onDismiss, 
  amountNeeded, 
  isOceania, 
  threshold 
}: CheckoutShippingNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  const handleSelectMoreItems = () => {
    handleDismiss()
    router.push("/")
  }

  const handleCheckoutNow = () => {
    handleDismiss()
    // Continue with checkout - the form submission will handle this
  }

  if (!isVisible) return null

  const regionName = isOceania ? "Oceania (AU/NZ)" : "Worldwide"
  const shippingType = isOceania ? "Standard" : "Standard International"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with glassmorphism effect */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />
      
      {/* Notification Card */}
      <Card 
        className={`relative w-full max-w-md mx-auto transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl`}
      >
        <CardContent className="p-6">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 backdrop-blur-sm mb-3">
              <Truck className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              🚚 Almost Free Shipping!
            </h3>
            <p className="text-sm text-muted-foreground">
              You're close to qualifying for free shipping
            </p>
          </div>

          {/* Amount Needed */}
          <div className="text-center mb-6">
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-orange-400 mb-1">
                {formatCurrency(amountNeeded)}
              </p>
              <p className="text-sm text-muted-foreground">
                away from <span className="font-semibold text-green-400">FREE {shippingType} shipping</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {regionName} • Free shipping over {formatCurrency(threshold)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Current Order</span>
              <span>Free Shipping at {formatCurrency(threshold)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(((threshold - amountNeeded) / threshold) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleSelectMoreItems}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Select More Items
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCheckoutNow}
              className="px-4 border-white/20 hover:bg-white/10 text-foreground"
            >
              Checkout Now
            </Button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-muted-foreground text-center mt-4 opacity-70">
            Free shipping automatically applied when threshold is met
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
