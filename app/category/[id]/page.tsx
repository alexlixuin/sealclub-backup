import { notFound } from "next/navigation"
import { categories, getProductsByCategory } from "@/lib/products"
import {
  generateCategoryMetadata,
  generateBreadcrumbSchema,
} from "@/lib/seo"
import ProductCard from "@/components/product-card"

interface CategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params before using its properties
  const resolvedParams = await params
  const categoryId = resolvedParams.id

  // Find the category by ID
  const category = categories.find((cat) => cat.id === categoryId)

  // If category doesn't exist, show 404
  if (!category) {
    notFound()
  }

  // Get products for this category
  const products = getProductsByCategory(categoryId)

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", url: `${process.env.NEXT_PUBLIC_SITE_URL}` },
    {
      name: category.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.id}`,
    },
  ])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        {category.description}. All products are for research purposes only and not for human consumption.
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">
            We couldn't find any products in this category. Please check back later.
          </p>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  )
}

// Generate static params for all categories
export function generateStaticParams() {
  return categories.map((category) => ({
    id: category.id,
  }))
}

// Generate metadata for the page
export async function generateMetadata({ params }: CategoryPageProps) {
  // Await params before using its properties
  const resolvedParams = await params
  const categoryId = resolvedParams.id

  const category = categories.find((cat) => cat.id === categoryId)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return generateCategoryMetadata(category)
}
