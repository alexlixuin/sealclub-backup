"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { testimonials } from "@/components/testimonials"

export default function ReviewSlideshow() {
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Still unsure? Discover real routines and results from the community.
          </p>
        </div>

        <Card className="max-w-6xl mx-auto bg-card/50 backdrop-blur-sm border">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-1">
                {[...Array(currentReview.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">{currentReview.title}</h3>
                <p className="text-muted-foreground leading-relaxed">"{currentReview.content}"</p>
              </div>

              <div className="space-y-4">
                <p className="font-medium">— {currentReview.name}</p>

                {/* Progress Indicators */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1 justify-center max-w-full overflow-hidden">
                    {testimonials.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-3 rounded-full transition-all duration-300 flex-shrink-0 ${
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
      </div>
    </section>
  )
}
