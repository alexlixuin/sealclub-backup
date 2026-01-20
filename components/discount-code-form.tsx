"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { Tag, Check, X, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function DiscountCodeForm() {
  const [code, setCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()
  const { subtotal, discount, setDiscount } = useCart()

  const handleApplyDiscount = async () => {
    if (!code.trim()) return

    console.log('🔍 Starting discount validation for code:', code.trim());
    console.log('📊 Current subtotal:', subtotal);
    setIsValidating(true)

    try {
      console.log('🌐 Making API call to /api/codes/validate');
      const response = await fetch("/api/codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          subtotal,
        }),
      })

      console.log('📡 Response status:', response.status, response.statusText);
      const data = await response.json()
      console.log('📋 Raw API Response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error || "Failed to validate discount code")
      }

      console.log('✅ API Response successful:', data);
      
      if (data.isValid) {
        let discountInfo;
        let toastMessage;
        
        console.log('Processing valid discount, type:', data.type);
        
        if (data.type === "sms") {
          // Handle SMS discount code
          console.log('SMS Code data:', data.smsCode);
          discountInfo = {
            code: data.smsCode.code,
            type: "percentage" as const,
            value: data.smsCode.discount_percentage,
            amountSaved: 0, // Let cart provider calculate this dynamically
          };
          console.log('SMS discountInfo created:', discountInfo);
          toastMessage = `SMS discount ${data.smsCode.code} applied: ${formatCurrency(data.discountAmount)} off`;
        } else if (data.type === "discount") {
          // Handle regular discount code
          discountInfo = {
            code: data.discount.code,
            type: data.discount.type,
            value: data.discount.value,
            amountSaved: data.discountAmount,
          };
          toastMessage = `${data.discount.code} discount applied: ${formatCurrency(data.discountAmount)} off`;
        } else if (data.type === "affiliate") {
          // Handle affiliate code (if it has a discount)
          discountInfo = {
            code: data.affiliateCode.code,
            type: "percentage",
            value: data.affiliateCode.discount_percentage || 0,
            amountSaved: data.discountAmount,
          };
          toastMessage = `Affiliate code ${data.affiliateCode.code} applied: ${formatCurrency(data.discountAmount)} off`;
        }
        
        console.log('Discount info created:', discountInfo);
        
        if (discountInfo) {
          console.log('Setting discount in form:', discountInfo);
          setDiscount(discountInfo);
          console.log('Discount set successfully');
          setCode(""); // Clear the input field
          toast({
            title: "Discount applied",
            description: toastMessage,
          });
        } else {
          console.error('No discount info created for type:', data.type);
        }
      } else {
        console.log('Code validation failed:', data);
        toast({
          variant: "destructive",
          title: "Invalid discount code",
          description: data.error || "This discount code is invalid or expired",
        })
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply discount code",
      })
    } finally {
      console.log('Discount validation completed');
      setIsValidating(false)
    }
  }

  const handleRemoveDiscount = () => {
    setDiscount(null)
    setCode("")
    toast({
      title: "Discount removed",
      description: "The discount code has been removed",
    })
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Discount Code</div>

      {discount ? (
        <div className="flex items-center justify-between rounded-md border p-2 bg-primary/5">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-medium">{discount.code}</span>
            <span className="text-sm text-muted-foreground">
              ({discount.type === "percentage" ? `${discount.value}%` : formatCurrency(discount.value)} off)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary">-{formatCurrency(discount.amountSaved)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={handleRemoveDiscount}
              aria-label="Remove discount"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter discount code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleApplyDiscount} disabled={!code.trim() || isValidating} className="whitespace-nowrap">
            {isValidating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
