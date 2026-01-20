import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getProductById } from "@/lib/products"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { STRIPE_TEST_MODE } from "@/lib/config"

export default function TestPage() {
  // Get the test product
  const testProduct = getProductById("test-product")

  // Use the test mode setting from config
  const isTestMode = STRIPE_TEST_MODE

  if (!testProduct) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Test Product Not Found</h1>
        <p>The test product could not be found. Please check your product configuration.</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test Checkout</h1>

      <Alert
        className={`mb-6 ${isTestMode ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}
      >
        <CheckCircle2 className={`h-4 w-4 ${isTestMode ? "text-green-600" : "text-amber-600"}`} />
        <AlertTitle>{isTestMode ? "Test Mode Enabled" : "Test Mode Disabled"}</AlertTitle>
        <AlertDescription>
          {isTestMode
            ? "Stripe test mode is enabled. You can use test cards like 4242 4242 4242 4242 for testing."
            : "Stripe is in LIVE mode. Real payments will be processed. To enable test mode, set STRIPE_TEST_MODE to true in lib/config.ts."}
        </AlertDescription>
      </Alert>

      <p className="mb-6">
        This page allows you to test the checkout process with a minimal $1.00 test product. No shipping costs will be
        applied to this test product.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{testProduct.name}</CardTitle>
            <CardDescription>Test product for checkout process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative mb-4 bg-muted rounded-lg overflow-hidden">
              <img
                src={testProduct.image || "/placeholder.svg"}
                alt={testProduct.name}
                className="object-contain w-full h-full p-4"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This is a test product that costs only $1.00. It is perfect for testing the checkout process without
                spending much money.
              </p>
              <p className="font-medium">Price: ${testProduct.price.toFixed(2)}</p>
              <p className="text-sm text-green-600 font-medium">No shipping costs for test products!</p>

              {isTestMode ? (
                <p className="text-sm text-blue-600 font-medium">✓ Stripe Test Mode is enabled</p>
              ) : (
                <p className="text-sm text-red-600 font-medium">⚠ Stripe is in LIVE mode</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <AddToCartButton product={testProduct} />
            <Link href="/cart">
              <Button variant="outline">View Cart</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold">Testing Instructions</h2>
        <div className="space-y-2">
          <p>Follow these steps to test the checkout process:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Add the test product to your cart using the button above</li>
            <li>Go to your cart and proceed to checkout</li>
            <li>Fill in the checkout form with test data</li>
            <li>Complete the payment using a test card (e.g., 4242 4242 4242 4242)</li>
            <li>You will be redirected to the success page if the payment is successful</li>
          </ol>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mt-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Test Card Information</h3>
          <p className="text-blue-700 mb-2">Use the following test card information for Stripe:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700">
            <li>Card Number: 4242 4242 4242 4242</li>
            <li>Expiration Date: Any future date (e.g., 12/25)</li>
            <li>CVC: Any 3 digits (e.g., 123)</li>
            <li>ZIP: Any 5 digits (e.g., 12345)</li>
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Toggle Test Mode</h3>
          <p className="text-gray-700 mb-2">
            To toggle between test and live mode, edit the{" "}
            <code className="bg-gray-200 px-1 py-0.5 rounded">STRIPE_TEST_MODE</code> value in{" "}
            <code className="bg-gray-200 px-1 py-0.5 rounded">lib/config.ts</code>.
          </p>
          <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            {`// In lib/config.ts
export const STRIPE_TEST_MODE = ${isTestMode.toString()} // Set to false for live mode`}
          </pre>
        </div>
      </div>
    </div>
  )
}
