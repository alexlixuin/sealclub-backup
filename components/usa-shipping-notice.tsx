"use client"

import { ExternalLink, Info } from "lucide-react"

export function USAShippingNotice() {
  const handleReadMore = () => {
    window.open("https://www.flightaware.com/live/flight/JST29#share", "_blank")
  }

  return (
    <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg">
      <div className="flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-500 mb-1">Shipments Unpaused </p>
              <p className="text-xs text-muted-foreground">
Our annual restocking trip to Thailand and India for pharmaceuticals has ended. All shipments during the hold period will be processed per usual, the waitlist has ended and new orders will be sent out as usual.         </p>
            </div>
            <button 
              onClick={handleReadMore}
              className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 flex items-center gap-1 whitespace-nowrap"
            >
              View Flight Info
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
