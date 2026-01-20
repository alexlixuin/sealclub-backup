"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Truck, Package } from "lucide-react"
import { testimonials } from "@/components/testimonials"
import Link from "next/link"
import { SeeReviewsButton } from "@/components/see-reviews-button"

export default function ReviewsWarehouseSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  const currentReview = testimonials[currentIndex]

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Review Slideshow - Left Side */}
          <div className="space-y-8">
            <div className="text-center xl:text-left">
              <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
              <p className="text-muted-foreground max-w-2xl">
                Still unsure? Explore real routines and results from the community.
              </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(Math.floor(currentReview.rating) || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">{currentReview.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{currentReview.content.length > 150 ? currentReview.content.substring(0, 150) + "..." : currentReview.content}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium text-sm">— {currentReview.name}</p>

                    {/* Progress Indicators */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1 justify-center max-w-full overflow-hidden">
                        {testimonials.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                              index === currentIndex ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {currentIndex + 1} of {testimonials.length}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* See Reviews Button */}
            <div className="w-full">
              <SeeReviewsButton />
            </div>
          </div>

          {/* Warehouse Card - Right Side */}
          <div className="space-y-8">
            <div className="text-center xl:text-left">
              <h2 className="text-3xl font-bold mb-4">Fast Local Dispatch</h2>
              <p className="text-muted-foreground max-w-2xl">
                Our Melbourne studio keeps bestsellers ready for rapid dispatch.
              </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                  {/* Left side - Warehouse Information */}
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Melbourne Dispatch
                      </Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">
                      Next Day Delivery
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Get your skincare and wellness essentials delivered faster with local Melbourne inventory.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Next day delivery available</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Local Melbourne warehouse</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Popular products in stock</span>
                      </div>
                    </div>

                    <Button asChild className="w-fit">
                      <Link href="/categories">
                        Shop Now
                      </Link>
                    </Button>
                  </div>

                  {/* Right side - Warehouse Image */}
                  <div className="relative bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 p-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium">Fast</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium">Reliable</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium">Secure</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium">Local</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
