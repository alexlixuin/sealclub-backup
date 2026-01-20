'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useRouter } from "next/navigation"
import { Droplets } from "lucide-react"

export function BacWaterReminder() {
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()
  const router = useRouter()

  useEffect(() => {
    // Check if BAC water is in cart
    const hasBacWater = items.some(item => 
      item.id.includes("bacteriostatic-water") || 
      item.name.toLowerCase().includes("bacteriostatic")
    )

    // Show popup if BAC water is not in cart and there are other items
    if (!hasBacWater && items.length > 0) {
      // Delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [items])

  const handleGoToBacWater = () => {
    setIsOpen(false)
    router.push('/product/bacteriostatic-water')
  }

  const handleDismiss = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-medium text-center">
            Forgot your BAC water?
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Most people need BAC water for reconstitution—don't forget it!
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToBacWater} className="w-full">
              Go to Bacteriostatic water
            </Button>
            <Button variant="outline" onClick={handleDismiss} className="w-full">
              No thanks
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
