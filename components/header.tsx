"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Menu, Search, ShoppingCart, User, X, ChevronDown, Star, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"
import MobileNavigation from "./mobile-navigation"

const categories = [
  {
    title: "SARMs",
    href: "/category/sarms",
    description: "SARMs for muscle growth, strength, and recomposition",
  },
  {
    title: "Growth Hormone",
    href: "/category/growth-hormone",
    description: "Growth hormone secretagogues",
  },
  {
    title: "Peptides for Muscle",
    href: "/category/peptides-muscle",
    description: "Peptides for muscle growth and regeneration",
  },
  {
    title: "Peptides for Skin",
    href: "/category/peptides-skin",
    description: "Peptides for skin health and tissue regeneration",
  },
  {
    title: "Weight Management",
    href: "/category/weight-management",
    description: "Peptides for weight management and metabolic research",
  },
  {
    title: "Aromatase Inhibitors",
    href: "/category/aromatase-inhibitors",
    description: "Aromatase inhibitors for estrogen suppression",
  },
  {
    title: "Peptide Stacks",
    href: "/category/peptide-stacks",
    description: "Peptide stacks for muscle growth and fat reduction",
  },
  {
    title: "Coenzymes",
    href: "/category/coenzymes",
    description: "Coenzymes for cellular metabolism",
  },
  {
    title: "Diluents",
    href: "/category/diluents",
    description: "Diluents for peptide reconstitution",
  },
  {
    title: "Topical Dermatologics",
    href: "/category/dermatologics",
    description: "Prescription Medication for Skin",
  },
  {
    title: "Anabolic Androgenic Steroids",
    href: "/category/aas",
    description: "Anabolic Androgenic Steroids (Injectables & Orals)",
  },
  {
    title: "Recovery & Healing",
    href: "/category/recovery-healing",
    description: "Peptides for recovery and healing",
  },
  {
    title: "Sexual Health & Libido",
    href: "/category/sexual-health",
    description: "Peptides for sexual health and libido enhancement",
  },
  {
    title: "Cognitive & Neurological",
    href: "/category/cognitive-neurological",
    description: "Peptides for cognitive enhancement and neurological support",
  },
  {
    title: "Sleep & Recovery",
    href: "/category/sleep-recovery",
    description: "Peptides for sleep enhancement and recovery",
  },
  {
    title: "Hormones & Regulators",
    href: "/category/hormones-regulators",
    description: "Hormone regulating peptides and compounds",
  },
  {
    title: "Metabolic & Longevity",
    href: "/category/metabolic-longevity",
    description: "Peptides for metabolic health and longevity",
  },
  {
    title: "Specialized Compounds",
    href: "/category/specialized-compounds",
    description: "Specialized research compounds and peptides",
  },
  {
    title: "Health & Wellness",
    href: "/category/health-wellness",
    description: "General health and wellness compounds",
  },
]

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const navigateTo = (href: string) => {
    router.push(href)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isScrolled ? "bg-background/95 shadow-sm" : "bg-background/95",
      )}
    >
      <div className="container flex h-16 items-center">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[400px] p-0 border-r border-border/60">
            <MobileNavigation categories={categories} />
          </SheetContent>
        </Sheet>

        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => navigateTo("/")}
          className="mr-6 flex items-center space-x-2"
        >
          <span className="bg-white rounded-full p-0.5 hidden sm:block">
            <Image src="/images/logo-ozptides-transparent.png" alt="OZPTides Logo" width={32} height={32} />
          </span>
        </button>

        <div className="hidden md:flex items-center space-x-6">
          <Popover open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Categories</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[900px] max-h-[80vh] overflow-y-auto p-0" align="start">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.href}
                      onClick={() => {
                        setIsCategoriesOpen(false)
                        navigateTo(category.href)
                      }}
                      className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:shadow-sm border border-transparent hover:border-border cursor-pointer"
                    >
                      <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                        {category.title}
                      </div>
                      <p className="line-clamp-2 text-xs leading-snug text-muted-foreground group-hover:text-muted-foreground/80">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer with quick links */}
                <div className="mt-4 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Browse all {categories.length} categories</span>
                    <div
                      onClick={() => {
                        setIsCategoriesOpen(false)
                        navigateTo("/categories")
                      }}
                      className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                    >
                      View All →
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            onClick={() => navigateTo("/about")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto"
          >
            About
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo("/faq")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto"
          >
            FAQ
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo("/contact")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto"
          >
            Contact
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo("/partners")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto"
          >
            Partners
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo("/next-day-delivery")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto"
          >
            Next Day Delivery
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo("/get-your-protocol")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto flex items-center gap-1"
          >
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            Get your FREE Routine
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo("/survey")}
            className="text-sm font-medium transition-colors hover:text-primary p-0 h-auto flex items-center gap-1"
          >
            <Gift className="h-4 w-4 text-green-500" />
            FREE Discount Survey
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm mr-2">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setIsSearchOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="mr-0 sm:mr-2">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => navigateTo("/account")}>
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => navigateTo("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
              {items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {items.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
