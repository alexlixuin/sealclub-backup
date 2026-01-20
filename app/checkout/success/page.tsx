"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { getOrderBySessionId } from "@/lib/actions"
import { getPayPalOrderByNumber } from "@/lib/paypal-order-retrieval"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, FileText, ShoppingBag } from "lucide-react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const orderNumber = searchParams.get("order_number")
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [emailStatus, setEmailStatus] = useState<"sending" | "success" | "error" | null>(null)
  const { clearCart } = useCart()

  useEffect(() => {
    // Only clear cart once when the component mounts
    const timer = setTimeout(() => {
      clearCart()
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Fetch the order details
    async function fetchOrder() {
      if (!sessionId && !orderNumber) return

      try {
        let orderData = null
        
        console.log("Session ID:", sessionId, "Order Number:", orderNumber)
        console.log("sessionId?.startsWith('paypal_'):", sessionId?.startsWith("paypal_"))
        console.log("Boolean check result:", sessionId?.startsWith("paypal_") && orderNumber)
        
        // Check if this is a PayPal order (session_id starts with "paypal_")
        if (sessionId?.startsWith("paypal_") && orderNumber) {
          console.log("Detected PayPal order, fetching by number:", orderNumber)
          orderData = await getPayPalOrderByNumber(orderNumber)
          console.log("PayPal order data retrieved:", orderData)
        } else if (sessionId && !sessionId.startsWith("paypal_")) {
          console.log("Detected Stripe order, fetching by session ID:", sessionId)
          orderData = await getOrderBySessionId(sessionId)
        } else {
          console.log("No valid session ID or order number provided")
          console.log("sessionId:", sessionId, "orderNumber:", orderNumber)
        }
        
        setOrder(orderData)

        // Trigger email sending manually since webhook might not be triggered
        if (orderData && orderNumber) {
          setEmailStatus("sending")
          const response = await fetch(`/api/manual-email-trigger?orderNumber=${orderNumber}`)
          const result = await response.json()

          if (result.success) {
            setEmailStatus("success")
          } else {
            setEmailStatus("error")
            console.error("Failed to send confirmation email:", result.error)
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [sessionId, orderNumber])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted"></div>
          <h2 className="mt-4 text-xl font-semibold">Loading order details...</h2>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold">Order not found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't find your order. Please contact customer support for assistance.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your order. We've sent a confirmation email to {order.customer.email}.
          </p>
          <p className="text-primary font-medium mt-2">Order Number: {orderNumber || order.orderNumber || "N/A"}</p>

          {emailStatus === "sending" && <p className="text-amber-500 text-sm mt-2">Sending confirmation email...</p>}
          {emailStatus === "success" && (
            <p className="text-green-500 text-sm mt-2">Confirmation email sent successfully!</p>
          )}
          {emailStatus === "error" && (
            <p className="text-red-500 text-sm mt-2">
              There was an issue sending your confirmation email. Please contact support if you don't receive it.
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-sm font-normal text-muted-foreground">Order ID: {order.id.substring(0, 8)}...</span>
            </CardTitle>
            <CardDescription>
              Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.shipping.name}</p>
                  <p>{order.shipping.address.line1}</p>
                  {order.shipping.address.line2 && <p>{order.shipping.address.line2}</p>}
                  <p>
                    {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.postalCode}
                  </p>
                  <p>{order.shipping.address.country}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Shipping Method</h3>
                <p className="text-sm text-muted-foreground">{order.shipping.carrier}</p>

                <h3 className="font-medium mt-4 mb-2">Payment Status</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      order.status === "paid" ? "bg-green-500" : "bg-amber-500"
                    }`}
                  ></span>
                  <span className="text-sm">{order.status === "paid" ? "Paid" : "Awaiting Payment"}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.amount.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.amount.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.amount.tax)}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.amount.total)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="#">
                <FileText className="mr-2 h-4 w-4" />
                Download Invoice
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            If you have any questions about your order, please contact our{" "}
            <Link href="/contact" className="text-primary hover:underline">
              customer support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
