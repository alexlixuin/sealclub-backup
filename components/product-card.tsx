"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getSpecificProductImage } from "@/lib/products"
import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { shimmerDataURL } from "@/lib/blur"
import { RefreshCw } from "lucide-react"

interface ProductCardProps {
  product: Product
  showCategories?: boolean
}

export default function ProductCard({ product, showCategories = false }: ProductCardProps) {
  const hasSubscription = product.subscriptionOptions && product.subscriptionOptions.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full group"
    >
      <Link href={`/product/${product.id}`} className="h-full block">
        <Card className="h-full overflow-hidden product-card border transition-all duration-300 hover:border-primary/50 hover:shadow-xl relative before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-primary/20 before:via-primary/40 before:to-primary/20 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:-z-10 group-hover:shadow-primary/20">
          <div className="aspect-square relative bg-muted/50">
            <Image
              src={getSpecificProductImage(product) || product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover p-4"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL={shimmerDataURL(700, 700)}
            />
            {/* Subscription indicator */}
            {hasSubscription && (
              <div className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-full px-2 py-1 shadow-sm flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                <span className="text-xs font-medium whitespace-nowrap">Subscription Available</span>
              </div>
            )}
            {product.bestSeller && !product.new && (
              <Badge variant="secondary" className="absolute top-2 right-2 text-xs font-medium">
                Best Seller
              </Badge>
            )}
          </div>
          <CardContent className="p-3 sm:p-4">
            <h3 className="font-medium line-clamp-1 text-sm sm:text-base">{product.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">{product.category}</p>
            
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="font-semibold text-sm sm:text-base">{formatCurrency(product.price)}</p>
                {product.sizeOptions && product.sizeOptions.length > 1 && (
                  <p className="text-xs text-muted-foreground">From</p>
                )}
              </div>
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">{product.sizeOptions[0].name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
