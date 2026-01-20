"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LimitedAvailabilityProps {
  productName: string
}

const getStockPercentage = (productName: string): number => {
  // High demand peptides (85-90%)
  if (productName.includes("Retatrutide") || productName.includes("Tirzepatide")) return 88
  if (productName.includes("HGH")) return 85
  
  // Popular peptides (75-82%)
  if (productName.includes("CJC-1295") || productName.includes("Ipamorelin")) return 78
  if (productName.includes("GLOW")) return 82
  
  // Moderate demand (65-75%)
  if (productName.includes("GHK-Cu") || productName.includes("GHK-CU")) return 72
  
  // Default for other products
  return 68
}

export function LimitedAvailability({ productName }: LimitedAvailabilityProps) {
  const stockPercentage = getStockPercentage(productName)
  return (
    <Card className="border-amber-200/20 bg-amber-50/5 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-amber-600 text-sm">Low Stock</h4>
              <p className="text-sm text-muted-foreground">
                This product has limited availability.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Stock Level</span>
                <span className="font-medium text-foreground">{stockPercentage}% Sold</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
