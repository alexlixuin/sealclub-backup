import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Flag as Flask, ShieldCheck, Truck } from "lucide-react"
import { getFeaturedProducts, getNewProducts, getBestSellerProducts, categories, getProductById } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { Testimonials, testimonials } from "@/components/testimonials"
import { MiniFAQ } from "@/components/mini-faq"
import { PopularProducts } from "@/components/popular-products"
import { ShippingNotification } from "@/components/shipping-notification"
import { SeeReviewsButton } from "@/components/see-reviews-button"
import { SMSPopupManager } from "@/components/sms-popup-manager"
import { generateMetadata, generateBreadcrumbSchema } from "@/lib/seo"
import type { Metadata } from "next"
import { GlobeSection } from "@/components/globe-section"
import { YouTubeEmbed } from "@/components/youtube-embed"
import ReviewSlideshow from "@/components/review-slideshow"
import { WarehouseCard } from "@/components/warehouse-card"
import ReviewsWarehouseSection from "@/components/reviews-warehouse-section"

export const metadata: Metadata = generateMetadata({
  title: "SealClub Beauty - Clinical-Grade Skincare & Wellness",
  description:
    "Premium skincare and wellness supplements designed for luminous skin, calm balance, and daily vitality. Dermatology-grade formulations, fast AU/NZ shipping.",
  keywords: [
    "clinical skincare australia",
    "wellness supplements",
    "beauty supplements",
    "dermatology-grade skincare",
    "glow supplements",
    "collagen support",
    "skin hydration",
    "premium skincare",
    "skin wellness australia",
    "clean beauty",
  ],
})

export default function Home() {
  // Get specific featured products by ID
  const specificFeaturedProducts = [
    getProductById("radiance-collagen"),
    getProductById("barrier-repair-serum"),
    getProductById("luminous-skin-complex"),
    getProductById("omega-glow-capsules"),
  ].filter((product): product is NonNullable<typeof product> => product !== null && product !== undefined)
  
  const newProducts = getNewProducts()
  const bestSellerProducts = getBestSellerProducts()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com" },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <SMSPopupManager />
      <ShippingNotification />
      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-pink-400/30 blur-[120px]" />
            <div className="absolute top-12 left-1/3 h-48 w-48 rounded-full bg-rose-300/30 blur-[110px]" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-pink-500/25 blur-[140px]" />
          </div>
          <div className="container relative z-20 py-24 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div className="max-w-2xl">
                <Badge className="mb-4 bg-white/60 text-rose-700 border border-white/40 shadow-sm">USE CODE SEALCLUB, 20% OFF SITEWIDE</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 gradient-text">
                  <a href="/next-day-delivery" className="hover:opacity-80 transition-opacity cursor-pointer">
                    Radiance-first skincare and wellness, curated for calm, glow, and long-term skin health.
                  </a>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Clinical-luxury formulas, modern beauty supplements, and targeted rituals crafted in Melbourne.
                  Visible results, gentle textures, and intentional daily care.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button size="lg" asChild>
                    <Link href="/categories">
                      Shop the Rituals
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <SeeReviewsButton />
                  <Button size="lg" variant="outline" asChild className="sm:col-span-2 justify-center">
                    <Link href="/categories">
                      Explore the <span className="text-yellow-400">Glow Edit</span>
                    </Link>
                  </Button>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl px-4 py-3 shadow-[0_20px_45px_rgba(236,72,153,0.2)]">
                    <p className="font-semibold">Melbourne-made</p>
                    <p className="text-muted-foreground">Local studio, global standards</p>
                  </div>
                  <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl px-4 py-3 shadow-[0_20px_45px_rgba(236,72,153,0.2)]">
                    <p className="font-semibold">Dermatology-grade</p>
                    <p className="text-muted-foreground">Ingredient-first formulas</p>
                  </div>
                  <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl px-4 py-3 shadow-[0_20px_45px_rgba(236,72,153,0.2)]">
                    <p className="font-semibold">Fast dispatch</p>
                    <p className="text-muted-foreground">AU/NZ priority shipping</p>
                  </div>
                </div>
              </div>

              <div className="relative grid gap-6">
                <Card className="overflow-hidden bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_30px_80px_rgba(236,72,153,0.25)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">The Ritual Edit</h3>
                      <Badge variant="secondary" className="bg-white/70 text-rose-700 border-white/40">
                        New
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                        <Image
                          src="/lab/setup_photo_1.jpg"
                          alt="SealClub Beauty studio"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 220px"
                        />
                      </div>
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                        <Image
                          src="/cream_gel.png"
                          alt="Clinical skincare"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 220px"
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-rose-100">
                      <div className="rounded-lg border border-white/40 bg-white/10 px-3 py-2">Barrier + Glow</div>
                      <div className="rounded-lg border border-white/40 bg-white/10 px-3 py-2">Hydration Daily</div>
                      <div className="rounded-lg border border-white/40 bg-white/10 px-3 py-2">Supplements</div>
                      <div className="rounded-lg border border-white/40 bg-white/10 px-3 py-2">Night Rituals</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-white/15 backdrop-blur-2xl border border-white/30 shadow-[0_30px_80px_rgba(236,72,153,0.2)]">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold">Inside Our Formulation Ritual</h3>
                      <p className="text-sm text-muted-foreground">
                        A clean look at how we blend, test, and finish our skincare and wellness essentials.
                      </p>
                    </div>
                    <YouTubeEmbed
                      videoId=""
                      title="Formulation Ritual"
                      className="shadow-lg aspect-[4/3]"
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-white/15 backdrop-blur-2xl border border-white/30 shadow-[0_30px_80px_rgba(236,72,153,0.2)]">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold">Pack an Order with Us</h3>
                      <p className="text-sm text-muted-foreground">
                        Step into our Melbourne studio and watch a real customer shipment.
                      </p>
                    </div>
                    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 shadow-lg bg-black/40 p-2">
                      <div className="relative w-full overflow-hidden rounded-lg" style={{ height: "360px" }}>
                        <blockquote
                          className="tiktok-embed"
                          cite="https://www.tiktok.com/@sealclubbeauty/video/7595100518226218248"
                          data-video-id="7595100518226218248"
                          style={{ width: "100%", minWidth: "240px", margin: 0, height: "100%" }}
                        >
                          <section>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href="https://www.tiktok.com/@sealclubbeauty"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              @sealclubbeauty
                            </a>
                            <p className="text-sm text-muted-foreground mt-2">
                              Come pack an order with me at our Melbourne studio
                            </p>
                          </section>
                        </blockquote>
                      </div>
                      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-pink-500/5">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
              <div>
                <Badge variant="secondary" className="mb-4 bg-white/70 text-rose-700 border-white/40">
                  The SealClub Method
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">A modern ritual for luminous skin.</h2>
                <p className="text-muted-foreground text-lg">
                  We blend clinically respected actives with a sensorial experience—so your routine feels calm, effective,
                  and undeniably premium.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_25px_60px_rgba(236,72,153,0.18)]">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Flask className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Clinical Formulas</h3>
                  <p className="text-muted-foreground">
                    Ingredient standards focused on clarity, hydration, and skin-calming support.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_25px_60px_rgba(236,72,153,0.18)]">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Quality Ritual</h3>
                  <p className="text-muted-foreground">Consistent batch testing and premium texture standards.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_25px_60px_rgba(236,72,153,0.18)]">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Fast Dispatch</h3>
                  <p className="text-muted-foreground">2-day AU/NZ delivery and international shipping available.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Strip */}
        <section className="py-14">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold">Real routines, real glow</h2>
                <p className="text-sm text-muted-foreground">Scroll to see quick notes from the community.</p>
              </div>
              <SeeReviewsButton />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {testimonials.map((review) => (
                <div
                  key={`${review.name}-${review.title}`}
                  className="min-w-[260px] sm:min-w-[320px] snap-start rounded-3xl border border-white/40 bg-white/20 backdrop-blur-2xl p-5 shadow-[0_20px_45px_rgba(236,72,153,0.2)]"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{review.title}</span>
                    <span>•</span>
                    <span>{review.product}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">“{review.content}”</p>
                  <p className="mt-4 text-xs text-muted-foreground">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews and Warehouse Section */}
        <ReviewsWarehouseSection />

        {/* Popular Products */}
        <PopularProducts />

        {/* Featured Products */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="text-sm text-muted-foreground">Editor’s picks for a polished, daily ritual.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/categories">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              {specificFeaturedProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[260px] sm:min-w-[300px] lg:min-w-[320px] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold">Shop by Category</h2>
                <p className="text-sm text-muted-foreground">
                  Curated lanes to build a ritual that feels effortless.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/categories">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/category/${category.id}`} className="snap-start">
                  <Card className="w-[260px] sm:w-[300px] overflow-hidden h-full category-card">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">New Arrivals</h2>
              <Button variant="outline" asChild>
                <Link href="/categories">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="product-grid">
              {newProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Global Shipping Section */}
        <GlobeSection />

        {/* Mini FAQ Section */}
        <MiniFAQ />

        {/* Testimonials Section */}
        <Testimonials />
      </div>
    </>
  )
}
