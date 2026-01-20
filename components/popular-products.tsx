import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getProductById } from "@/lib/products"
import ProductCard from "@/components/product-card"

export function PopularProducts() {
  // Get the specific popular products
    const popularProductIds = ["radiance-collagen", "night-repair-capsules", "radiance-matcha-latte", "luminous-skin-complex", "vitamin-c-brightening-ampoule", "omega-glow-capsules", "barrier-repair-serum", "eye-revival-gel"]

  const popularProducts = popularProductIds.map((id) => getProductById(id)).filter((product) => product !== undefined)

  return (
    <section className="py-16 bg-pink-500/5">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Popular Products</h2>
            <p className="text-sm text-muted-foreground">Best-loved rituals, ready to slide through.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/categories">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-white/40 bg-white/20 backdrop-blur-2xl p-6 shadow-[0_25px_60px_rgba(236,72,153,0.18)]">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {popularProducts.map((product) => (
              <div
                key={product?.id}
                className="min-w-[260px] sm:min-w-[300px] lg:min-w-[320px] snap-start"
              >
                {product && <ProductCard product={product} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
