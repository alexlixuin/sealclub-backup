"use client"

import { useState, useEffect } from "react"
import { X, Truck, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ShippingNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed the notification
    const hasSeenNotification = localStorage.getItem("shipping-notification-dismissed")
    
    if (!hasSeenNotification) {
      // Show notification after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem("shipping-notification-dismissed", "true")
    }, 300)
  }

  if (!isVisible) return null

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm mb-3">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              🚚 Free Shipping Available!
            </h3>
            <p className="text-sm text-muted-foreground">
              Save on shipping costs with our free delivery thresholds
            </p>
          </div>

          {/* Shipping Options */}
          <div className="space-y-3 mb-6">
            {/* Oceania Shipping */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">Oceania (AU/NZ)</h4>
                <p className="text-xs text-muted-foreground">Free shipping on orders over <span className="font-bold text-green-400">$250</span></p>
              </div>
            </div>

            {/* International Shipping */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">Worldwide (USA/EU/Asia)</h4>
                <p className="text-xs text-muted-foreground">Free shipping on orders over <span className="font-bold text-blue-400">$500</span></p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleDismiss}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              Start Shopping
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="px-4 border-white/20 hover:bg-white/10 text-foreground"
            >
              Dismiss
            </Button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-muted-foreground text-center mt-4 opacity-70">
            Free shipping automatically applied at checkout when threshold is met
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
