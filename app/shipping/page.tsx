import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Truck, Clock, Globe, AlertTriangle } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p>
            This Shipping Policy outlines the shipping methods, timeframes, and policies for orders placed on the
            SealClub Beauty website.
          </p>

          <div className="flex items-start gap-4 my-6 not-prose">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Shipping Methods</h2>
              <p className="text-muted-foreground mt-2">We offer the following shipping methods for all orders:</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-medium">Standard Shipping:</span>
                  <span className="text-muted-foreground">2-4 business days ($25.99)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">International Shipping:</span>
                  <span className="text-muted-foreground">1-2 business days ($50.99)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 my-6 not-prose">
            <div className="bg-primary/10 p-3 rounded-full">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Processing Time</h2>
              <p className="text-muted-foreground mt-2">
                All orders are processed within 2-3 business days. Orders placed after 2:00 PM EST will be processed the
                next business day. Our shipping days vary between Thursday and Friday being sent the following Monday
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 my-6 not-prose">
            <div className="bg-primary/10 p-3 rounded-full">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">International Shipping</h2>
              <p className="text-muted-foreground mt-2">
                We ship to select international destinations. International shipping times vary depending on the
                destination country. Please contact us for specific information about shipping to your country.
              </p>
              <p className="text-muted-foreground mt-2">
                Please note that international orders may be subject to import duties, taxes, and customs clearance
                fees, which are the responsibility of the recipient.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 my-6 not-prose">
            <div className="bg-destructive/10 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Shipping Restrictions</h2>
              <p className="text-muted-foreground mt-2">
                Due to regulatory restrictions, we cannot ship certain products to specific countries or regions. Please
                contact us if you have questions about shipping restrictions for your location.
              </p>
            </div>
          </div>

          <h2>Tracking Information</h2>
          <p>
            Once your order has been shipped, you will receive a shipping confirmation email with tracking information.
            You can use this tracking number to monitor the status of your shipment.
          </p>

          <h2>Delivery Issues</h2>
          <p>
            If you experience any issues with your delivery, such as damaged packages or missing items, please contact
            us within 48 hours of receiving your order. We will work with you to resolve any problems as quickly as
            possible.
          </p>

          <h2>Address Changes</h2>
          <p>
            If you need to change your shipping address after placing an order, please contact us as soon as possible.
            We cannot guarantee that we will be able to change the shipping address once an order has been processed.
          </p>

          <h2>Contact Information</h2>
          <p>If you have any questions about our shipping policy, please contact us at:</p>
          <p>
            Email: shipping@sealclubbeauty.com
            <br />
            Phone: +1 (888) 123-4567
          </p>
        </div>

        <Separator className="my-8" />

        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
