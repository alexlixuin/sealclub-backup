"use client"

import { useEffect } from "react"
import { useCrisp } from "@/hooks/use-crisp"
import { Mail, MessageCircle, Phone, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Breadcrumb from "@/components/breadcrumb"

export default function ContactPage() {
  const { openChat } = useCrisp()

  // Open chat automatically when the page loads
  useEffect(() => {
    // Small delay to ensure the chat is loaded
    const timer = setTimeout(() => {
      openChat()
    }, 1000)

    return () => clearTimeout(timer)
  }, [openChat])

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <Breadcrumb />

      <div className="flex flex-col items-center text-center mb-12 mt-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          We're here to help with any questions about our research chemicals, orders, or technical support.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Live Chat Support
            </CardTitle>
            <CardDescription>Fastest way to get help</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Our live chat is available in the bottom-right corner of every page on our website.</p>
            <Button onClick={openChat} className="w-full">
              Open Chat Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Support
            </CardTitle>
            <CardDescription>Response within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Send us an email and we'll get back to you as soon as possible.</p>
            <Button variant="outline" asChild>
              <a href="mailto:support@ozptides.com">support@ozptides.com</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Phone Support
            </CardTitle>
            <CardDescription>For urgent inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Call us directly for immediate assistance with your order.</p>
            <Button variant="outline" asChild>
              <a href="tel:+61234567890">+1 (307) 400-7602</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Access Live Chat Support</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium mb-2">From Any Page:</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Look for the chat bubble icon in the bottom-right corner of the screen</li>
              <li>Click on the icon to open the chat window</li>
              <li>Type your message and press enter to start chatting with our support team</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">From Product Pages:</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Scroll down to the "Have Questions?" section</li>
              <li>Click the "Chat with Support" button</li>
              <li>The chat window will open with the product details pre-filled</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>9:00 AM - 6:00 PM AEST</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>10:00 AM - 4:00 PM AEST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Live chat support is available during business hours. Email support is monitored 24/7.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Our Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our headquarters is located in Sydney, Australia. All products ship from our secure warehouses in
              Australia and China.
            </p>
            <p className="text-sm text-muted-foreground">
              Note: Our physical location does not accept walk-in customers or product pickups.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
        <Button onClick={openChat} size="lg" className="mx-auto">
          Start Live Chat Now
        </Button>
      </div>
    </div>
  )
}
