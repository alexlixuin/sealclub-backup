"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
            <p className="text-muted-foreground">
              It looks like you've lost your internet connection. Don't worry, you can still browse previously viewed pages.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Go to Homepage
              </Link>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> When you're back online, any orders you tried to place will be automatically synced.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
