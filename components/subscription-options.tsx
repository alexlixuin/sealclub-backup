"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, Zap } from "lucide-react"
import type { SubscriptionOption } from "@/lib/types"

interface SubscriptionOptionsProps {
  subscriptionOptions: SubscriptionOption[]
  selectedSubscription: SubscriptionOption | null
  onSubscriptionChange: (subscription: SubscriptionOption | null) => void
  selectedSize: string
  isOneTime: boolean
  onToggleSubscription: (isSubscription: boolean) => void
}

export function SubscriptionOptions({
  subscriptionOptions,
  selectedSubscription,
  onSubscriptionChange,
  selectedSize,
  isOneTime,
  onToggleSubscription,
}: SubscriptionOptionsProps) {
  if (!subscriptionOptions || subscriptionOptions.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium text-white">Purchase Options</h3>
      </div>

      {/* One-time vs Subscription Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            isOneTime 
              ? 'border-primary bg-primary/5 shadow-lg' 
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'
          }`}
          onClick={() => onToggleSubscription(false)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">One-time Purchase</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Buy once, no commitment</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            !isOneTime 
              ? 'border-primary bg-primary/5 shadow-lg' 
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'
          }`}
          onClick={() => onToggleSubscription(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">Subscription</span>
              <Badge variant="secondary" className="text-xs">Save 10%</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">Auto-delivery monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Size Options */}
      {!isOneTime && (
        <div className="space-y-3">
          <div className="text-sm text-gray-300">
            Choose your monthly subscription size for <span className="text-primary">{selectedSize}</span>:
          </div>
          
          <div className="grid gap-2">
            {subscriptionOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedSubscription?.id === option.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'
                }`}
                onClick={() => onSubscriptionChange(option)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {option.name}
                        </span>
                        {option.description && (
                          <span className="text-xs text-gray-400">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        ${option.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        per {option.interval}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-200">
                <div className="font-medium mb-1">Subscription Benefits:</div>
                <ul className="space-y-1 text-amber-200/80">
                  <li>• 10% discount on all subscription orders</li>
                  <li>• Automatic monthly delivery</li>
                  <li>• Skip or cancel anytime</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
