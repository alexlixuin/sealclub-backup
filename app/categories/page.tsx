import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { categories } from "@/lib/products"

export default function CategoriesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Product Categories</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        Browse our extensive range of research chemicals by category. All products are for research purposes only and
        not for human consumption.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.id}`}>
            <Card className="overflow-hidden h-full category-card">
              <div className="aspect-video relative">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
