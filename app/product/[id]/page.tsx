import Link from "next/link"
import Image from "next/image"
import { shimmerDataURL } from "@/lib/blur"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  Award,
  AlertTriangle,
  Info,
  FileText,
  FlaskRoundIcon as Flask,
  Tag,
} from "lucide-react"
import {
  getProductById,
  getRelatedProducts,
  products,
  getSpecificProductImage,
  getProductCategories,
  generateSizeInfo,
} from "@/lib/products"
import { formatCurrency } from "@/lib/utils"
import ProductSizeSelector from "@/components/product-size-selector"
import { SimpleAddToCart } from "@/components/simple-add-to-cart"
import ProductReviews from "@/components/product-reviews"
import { LimitedAvailability } from "@/components/limited-availability"
import { ProductTestimonial } from "@/components/product-testimonial"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductChatButton } from "@/components/product-chat-button"
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo"
import { mockReviews } from "@/components/product-reviews"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const product = getProductById(resolvedParams.id)
  if (!product) {
    return {}
  }
  return generateProductMetadata(product)
}

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Explicitly await the params object to satisfy Next.js
  const resolvedParams = await params
  const product = getProductById(resolvedParams.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product.id)
  const hasSizeOptions = product.sizeOptions && product.sizeOptions.length > 0

  // Get all categories for this product
  const productCategories = getProductCategories(product)

  const reviews = mockReviews[product.id] || []
  const productJsonLd = generateProductSchema({ ...product, reviews })
  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", url: `${process.env.NEXT_PUBLIC_SITE_URL}` },
    {
      name: product.category,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${product.categorySlug}`,
    },
    {
      name: product.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.id}`,
    },
  ])

  return (
    <div className="container py-10">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/category/${product.categorySlug}`} className="hover:text-foreground">
          {product.category.split(" ")[0]}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-12 items-start mb-12">
        <div className="relative aspect-square">
          <Image
            src={getSpecificProductImage(product) || product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={shimmerDataURL(1200, 1200)}
          />
          {product.new && <Badge className="absolute top-4 right-4">New</Badge>}
          {product.bestSeller && !product.new && (
            <Badge variant="secondary" className="absolute top-4 right-4">
              Best Seller
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">{product.category}</p>

            {/* Display all categories */}
            {productCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {productCategories.map((category, index) => (
                  <Badge key={index} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="px-2 py-1">
              Research Use Only
            </Badge>
            <Badge variant="outline" className="px-2 py-1">
              Not for Human Consumption
            </Badge>
            {product.new && (
              <Badge variant="outline" className="px-2 py-1 bg-primary/10 text-primary">
                New Product
              </Badge>
            )}
          </div>

          {product?.name && <ProductTestimonial productName={product.name} />}

          {product?.name && <LimitedAvailability productName={product.name} />}

          {hasSizeOptions ? (
            <ProductSizeSelector product={product} />
          ) : (
            <SimpleAddToCart product={product} />
          )}

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="font-semibold">Product Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-[180px]">Chemical Name:</TableHead>
                  <TableCell>{product.chemicalName || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>CAS Number:</TableHead>
                  <TableCell>{product.casNumber || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Size Info:</TableHead>
                  <TableCell>
                    {product.sizeOptions && product.sizeOptions.length > 0 ? (
                      <div className="space-y-1">
                        {product.sizeOptions.map((option) => (
                          <div key={option.id} className="text-sm">
                            <span className="font-medium">{option.name}:</span>{" "}
                            {option.sizeInfo || 
                             generateSizeInfo(product.name, option.name, product.concentration) ||
                             option.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      product.concentration || "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Purity:</TableHead>
                  <TableCell>{product.purity || "≥98% (HPLC)"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Terms:</TableHead>
                  <TableCell className="font-medium">
                    For research purposes only. Not for human consumption or in vivo research.
                  </TableCell>
                </TableRow>
                
              </TableBody>
            </Table>
          </div>

          <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3 mt-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              <strong>Important:</strong> This product is for research purposes only and not for human consumption. By
              purchasing, you confirm compliance with all applicable laws and regulations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">2-4 Day Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">In-house Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">COA Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Flask className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Dermatology-Grade</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Technical Details</TabsTrigger>
          <TabsTrigger value="storage">Storage & Handling</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-6">
          <div className="prose prose-invert max-w-none">
            <p>{product.description}</p>
            <h3>Intended Use</h3>
            <p>
              This product is intended for external or dietary use as directed. Always follow the directions on the
              label and consult a healthcare professional if you are pregnant, nursing, or under medical care.
            </p>
            <h3>Quality Assurance</h3>
            <p>
              All SealClub Beauty products undergo rigorous testing to ensure quality and consistency. Each batch is
              tested for identity, purity, and performance before release. Certificates of Analysis (COA) are available upon
              request.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="details" className="pt-6">
          <div className="prose prose-invert max-w-none">
            <h3>Technical Specifications</h3>
            <ul>
              <li>
                <strong>Chemical Name:</strong> {product.chemicalName || "N/A"}
              </li>
              <li>
                <strong>CAS Number:</strong> {product.casNumber || "N/A"}
              </li>
              <li>
                <strong>Concentration:</strong> {product.concentration || "N/A"}
              </li>
              <li>
                <strong>Quantity:</strong> {product.quantity}
              </li>
              <li>
                <strong>Category:</strong> {product.category}
              </li>
              <li>
                <strong>Purity:</strong> {product.purity || "≥98% (HPLC)"}
              </li>
              {product.halfLife && (
                <li>
                  <strong>Half-Life:</strong> {product.halfLife}
                </li>
              )}
              {product.molecularFormula && (
                <li>
                  <strong>Molecular Formula:</strong> {product.molecularFormula}
                </li>
              )}
              {product.molecularWeight && (
                <li>
                  <strong>Molecular Weight:</strong> {product.molecularWeight}
                </li>
              )}
            </ul>
            <h3>Testing Methods</h3>
            <p>Our products are tested using the following analytical methods:</p>
            <ul>
              <li>High-Performance Liquid Chromatography (HPLC)</li>
              <li>Mass Spectrometry (MS)</li>
              <li>Nuclear Magnetic Resonance (NMR)</li>
              <li>Elemental Analysis</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="storage" className="pt-6">
          <div className="prose prose-invert max-w-none">
            <h3>Storage Conditions</h3>
            <p>
              {product.storage ||
                "Store in a cool, dry place away from direct sunlight. For optimal stability, store at -20°C, protected from light."}
            </p>
            <h3>Handling Precautions</h3>
            <p>Handle with appropriate laboratory safety equipment and procedures:</p>
            <ul>
              <li>Use personal protective equipment (gloves, lab coat, safety glasses)</li>
              <li>Work in a well-ventilated area or under a fume hood if necessary</li>
              <li>Avoid contact with skin, eyes, and clothing</li>
              <li>Wash hands thoroughly after handling</li>
            </ul>
            <h3>Reconstitution (for lyophilized products)</h3>
            <p>
              For lyophilized (freeze-dried) products, reconstitute with bacteriostatic water or other appropriate
              diluent. Specific reconstitution protocols are available upon request.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="pt-6">
          <ProductReviews productId={product.id} />
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                <Card className="h-full overflow-hidden product-card">
                  <div className="aspect-square relative bg-muted/50">
                    <Image
                      src={getSpecificProductImage(relatedProduct) || relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover p-4"
                    />
                    {relatedProduct.new && <Badge className="absolute top-2 right-2">New</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-1">{relatedProduct.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{relatedProduct.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <p className="font-semibold">{formatCurrency(relatedProduct.price)}</p>
                        {relatedProduct.sizeOptions && relatedProduct.sizeOptions.length > 1 && (
                          <p className="text-xs text-muted-foreground">From</p>
                        )}
                      </div>
                      {relatedProduct.sizeOptions && relatedProduct.sizeOptions.length > 0 && (
                        <p className="text-sm text-muted-foreground">{relatedProduct.sizeOptions[0].name}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 bg-muted/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Need More Information?</h3>
            <p className="text-muted-foreground mt-2">
              If you need additional information about this product, including technical specifications, certificates of
              analysis, or research protocols, please contact our support team.
            </p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/contact">
                  <FileText className="h-4 w-4" />
                  Request COA
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat with Support Section */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Have questions about this product?</h3>
            <p className="text-muted-foreground">
              Our support team is ready to help with any questions about this research chemical.
            </p>
          </div>
          <ProductChatButton productName={product.name} />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  )
}
