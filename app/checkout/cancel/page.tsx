import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, ShoppingCart } from "lucide-react"

export default function CheckoutCancelPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Checkout Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Your checkout process was cancelled and no payment has been processed.
            </p>
            <p className="text-muted-foreground mt-2">
              Your items are still in your cart if you'd like to complete your purchase.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
              <Link href="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Return to Cart
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
