"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SearchIcon, Filter, X } from "lucide-react"
// Add the import for getSpecificProductImage
import { searchProducts, getSpecificProductImage } from "@/lib/products"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/products"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300])

  useEffect(() => {
    if (query) {
      setIsLoading(true)
      const searchResults = searchProducts(query)
      setResults(searchResults)
      setIsLoading(false)
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsLoading(true)
      const searchResults = searchProducts(searchQuery)
      setResults(searchResults)
      setIsLoading(false)

      // Update URL without refreshing the page
      const url = new URL(window.location.href)
      url.searchParams.set("q", searchQuery)
      window.history.pushState({}, "", url.toString())
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const filteredResults = results.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.some((cat) => product.categorySlug.includes(cat))
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesCategory && matchesPrice
  })

  const uniqueCategories = Array.from(new Set(results.map((product) => product.categorySlug)))

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Search Products</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {query && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredResults.length} results for &quot;{query}&quot;
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {results.length > 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter Results
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Categories</h4>
                  <div className="space-y-2">
                    {uniqueCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${category}`} className="text-sm">
                          {category
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">${priceRange[0]}</span>
                      <span className="text-sm">${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategories([])
                    setPriceRange([0, 300])
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={`${results.length > 0 ? "md:col-span-3" : "md:col-span-4"}`}>
          {isLoading ? (
            <div className="text-center py-12">
              <p>Searching...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="product-grid">
              {filteredResults.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="h-full overflow-hidden product-card">
                    <div className="aspect-square relative bg-muted/50">
                      {/* Update the Image component in the search results */}
                      <Image
                        src={getSpecificProductImage(product) || product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover p-4"
                      />
                      {product.new && <Badge className="absolute top-2 right-2">New</Badge>}
                      {product.bestSeller && !product.new && (
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          Best Seller
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-semibold">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-1">
                We couldn&apos;t find any products matching &quot;{query}&quot;
              </p>
              <Button className="mt-4" asChild>
                <Link href="/">Browse All Products</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Search for products</h3>
              <p className="text-muted-foreground mt-1">Enter a search term to find products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
