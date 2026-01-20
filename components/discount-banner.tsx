"use client"

import { AlertCircle, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface DiscountBannerProps {
  className?: string
}

export function DiscountBanner({ className }: DiscountBannerProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    {
      icon: AlertCircle,
      text: <><span className="font-bold">Follow our TikTok </span><span className="font-bold">@sealclubbeauty</span> for 20% off</>
    },
    {
      icon: AlertCircle,
      text: <><span className="font-bold">Subscription Rituals</span> are here! Automatic delivery every month</>
    },
    {
      icon: AlertCircle,
      text: <>Use code <span className="font-bold">SEALCLUB</span> for 10% off your first order</>
    },
    {
      icon: Truck,
      text: <>Free Shipping on ALL orders above <span className="font-bold">$250.00</span></>
    },
    {
      icon: AlertCircle,
      text: <>Next Day Delivery <span className="font-bold">Available Only for Melbourne Residents — Select Products Only</span></>
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = messages[messageIndex].icon;

  return (
    <div className={cn("bg-primary/20 py-2 text-center border-b border-primary/20", className)}>
      <div className="container flex items-center justify-center gap-2">
        <CurrentIcon className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">
          {messages[messageIndex].text}
        </p>
      </div>
    </div>
  )
}
