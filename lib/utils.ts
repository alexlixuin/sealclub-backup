import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

// Update the getProductImage function to use the new images based on product type

export function getProductImage(category: string): string {
  // Default category images
  const categories: Record<string, string> = {
    sarms: "/images/sarms-tablet-products.webp",
    "growth-hormone": "/images/vials-sub-inject.png",
    "peptides-muscle": "/images/muscle-pixlr.webp",
    "peptides-skin": "/images/skin-pixlr.webp",
    "weight-management": "/images/weight-pixlr.webp",
    "aromatase-inhibitors": "/images/aroma-pixlr.png",
    "peptide-stacks": "/images/bulk-bundle-products.png",
    coenzymes: "/images/deals.png",
    diluents: "/images/bacterial_water.webp",
    dermatologics: "/images/gel.png",
    // new categories
    "recovery-healing": "/images/vials-sub-inject.png",
    "sexual-health": "/images/skin-pixlr.webp",
    "cognitive-neurological": "/images/aroma-pixlr.png",
    "sleep-recovery": "/images/muscle-pixlr.webp",
    "hormones-regulators": "/images/vials-sub-inject.png",
    "metabolic-longevity": "/images/weight-pixlr.webp",
    "specialized-compounds": "/images/bulk-bundle-products.png",
    "health-wellness": "/images/vials-sub-inject.png",
  }

  return categories[category] || "/images/vials-sub-inject.png"
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}
