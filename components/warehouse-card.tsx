"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight, Clock } from "lucide-react"
import { getBestSellerProducts, getFeaturedProducts, getNewProducts, type Product } from "@/lib/products"

export function WarehouseCard() {
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  
  // Memoize a curated selection of products for better performance
  const rotationProducts = useMemo(() => {
    const bestSellers = getBestSellerProducts().slice(0, 8)
    const featured = getFeaturedProducts().slice(0, 6)
    const newProducts = getNewProducts().slice(0, 4)
    
    // Combine and deduplicate products
    const combined = [...bestSellers, ...featured, ...newProducts]
    const unique = combined.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    )
    
    return unique.slice(0, 15) // Limit to 15 products for optimal performance
  }, [])

  // Rotate products every 4 seconds (slightly slower for better UX)
  useEffect(() => {
    if (rotationProducts.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % rotationProducts.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [rotationProducts.length])

  const currentProduct = rotationProducts[currentProductIndex]

  if (!currentProduct) return null

  return (
    <section className="py-16">
      <div className="container">
        <Card className="overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/30 border-primary/20">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
              {/* Left side - Warehouse Information */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Melbourne Dispatch
                  </Badge>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Fast Local Dispatch
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Our Melbourne studio stocks the most loved skincare and wellness essentials for rapid dispatch.
                  Get your products delivered faster with our local inventory.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">Next-day delivery available for Melbourne</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">2-day shipping across Australia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">Popular products always in stock</span>
                  </div>
                </div>

                <Button asChild className="w-fit">
                  <Link href="/next-day-delivery">
                    Learn More About Fast Delivery
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Right side - Rotating Products */}
              <div className="relative bg-gradient-to-br from-background/50 to-secondary/20 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Popular Products in Stock</span>
                </div>

                {/* Product Display */}
                <div className="relative">
                  <Link href={`/product/${currentProduct.id}`} className="block group">
                    <div className="relative aspect-square w-48 mx-auto mb-6 rounded-lg overflow-hidden bg-background/50 border border-border/50 group-hover:border-primary/50 transition-all duration-300">
                      <Image
                        src={currentProduct.image}
                        alt={currentProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {currentProduct.new && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                          NEW
                        </Badge>
                      )}
                      {currentProduct.bestSeller && (
                        <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                          BEST SELLER
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <div className="text-center">
                    <Link href={`/product/${currentProduct.id}`} className="group">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {currentProduct.name}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-primary mb-4">
                      ${currentProduct.price.toFixed(2)}
                    </p>
                    
                    {/* Product indicators */}
                    <div className="flex justify-center gap-2 mb-4">
                      {rotationProducts.map((_, index: number) => (
                        <div
                          key={index}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            index === currentProductIndex
                              ? 'bg-primary w-6' 
                              : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>

                    <Button asChild size="sm" className="w-full">
                      <Link href={`/product/${currentProduct.id}`}>
                        View Product
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Stock indicator */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-600 font-medium">In Stock</span>
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
