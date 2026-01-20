"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { categories } from "@/lib/products"

export default function Breadcrumb() {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)

  // Don't show breadcrumbs on homepage
  if (paths.length === 0) return null

  // Get category name if we're on a category page
  let categoryName = ""
  if (paths[0] === "category" && paths.length > 1) {
    const category = categories.find((cat) => cat.id === paths[1])
    if (category) {
      categoryName = category.name
    }
  }

  return (
    <nav className="flex items-center text-sm text-muted-foreground py-4 px-6">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>

      <ChevronRight className="h-4 w-4 mx-2" />

      {paths[0] === "category" ? (
        <>
          <Link href="/categories" className="hover:text-foreground transition-colors">
            Categories
          </Link>

          {paths.length > 1 && (
            <>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="font-medium text-foreground">{categoryName}</span>
            </>
          )}
        </>
      ) : (
        <span className="font-medium text-foreground capitalize">{paths[0].replace(/-/g, " ")}</span>
      )}
    </nav>
  )
}
