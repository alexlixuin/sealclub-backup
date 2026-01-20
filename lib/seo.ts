import type { Metadata } from 'next'
import type { Review } from './types'
import { getSpecificProductImage } from '@/lib/products'

// Base SEO configuration
export const siteConfig = {
  name: "SealClub Beauty",
  title: "SealClub Beauty | Clinical-Grade Skincare & Wellness",
  description: "Premium skincare and wellness supplements crafted for luminous skin, calm balance, and daily vitality. Fast AU/NZ shipping with international delivery options.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com",
  ogImage: "/og-image.jpg",
  keywords: [
    "clinical skincare",
    "beauty supplements",
    "wellness supplements",
    "skin hydration",
    "skin barrier support",
    "collagen support",
    "calm balance",
    "glow essentials",
    "premium skincare australia",
    "dermatology grade skincare",
    "clean beauty",
    "daily wellness"
  ],
  author: "SealClub Beauty",
  creator: "SealClub Beauty",
  publisher: "SealClub Beauty",
  category: "Skincare & Wellness",
}

// Generate metadata for pages
export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  noIndex = false,
  canonical,
}: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  canonical?: string
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const metaDescription = description || siteConfig.description
  const metaKeywords = [...siteConfig.keywords, ...keywords].join(", ")
  const metaImage = image || siteConfig.ogImage

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    category: siteConfig.category,
    ...(noIndex && { robots: { index: false, follow: false } }),
    ...(canonical && { alternates: { canonical } }),
    openGraph: {
      type: "website",
      locale: "en_AU",
      url: canonical || siteConfig.url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: "@sealclubbeauty",
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
    },
  }
}

// Product-specific SEO
export function generateProductMetadata(product: {
  name: string
  description: string
  price: number
  category: string
  image: string
  id: string
  purity?: string
  chemicalName?: string
  casNumber?: string
}) {
  const title = `${product.name} - Clinical-Grade Skincare & Wellness`
  const description = `Discover ${product.name}. ${product.description.slice(0, 120)}... Premium skincare and wellness, fast shipping Australia & worldwide.`
  
  const keywords = [
    product.name.toLowerCase(),
    product.category.toLowerCase(),
    `buy ${product.name}`,
    `${product.name} australia`,
    "clinical skincare",
    "wellness supplement",
    "clean beauty"
  ].filter((keyword): keyword is string => Boolean(keyword))

  return generateMetadata({
    title,
    description,
    keywords,
    image: getSpecificProductImage(product as any) || product.image,
    canonical: `${siteConfig.url}/product/${product.id}`,
  })
}

// Category-specific SEO
export function generateCategoryMetadata(category: {
  name: string
  description: string
  id: string
}) {
  const title = `${category.name} Skincare & Wellness - Premium Quality`
  const description = `Shop ${category.name.toLowerCase()} skincare and wellness essentials. Premium quality, fast shipping. ${category.description}`
  
  const keywords = [
    `${category.name.toLowerCase()} skincare`,
    `buy ${category.name.toLowerCase()}`,
    `${category.name.toLowerCase()} australia`,
    `clinical ${category.name.toLowerCase()}`,
    `premium ${category.name.toLowerCase()}`,
  ]

  return generateMetadata({
    title,
    description,
    keywords,
    canonical: `${siteConfig.url}/category/${category.id}`,
  })
}

// JSON-LD structured data generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: "English",
      areaServed: ["AU", "NZ", "US", "CA", "GB"]
    },
    sameAs: [
      "https://twitter.com/sealclubbeauty",
      "https://instagram.com/sealclubbeauty"
    ]
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  price: number
  image: string
  id: string
  category: string
  purity?: string
  availability?: boolean
  reviews?: Review[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: getSpecificProductImage(product as any) || product.image,
    url: `${siteConfig.url}/product/${product.id}`,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    ...(product.reviews && product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length).toFixed(1),
        reviewCount: product.reviews.length
      },
      review: product.reviews.map(review => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.author },
        datePublished: review.date,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: "5"
        },
        reviewBody: review.content
      }))
    }),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "AUD",
      availability: product.availability !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: siteConfig.name
      }
    },
    additionalProperty: product.purity ? [
      {
        "@type": "PropertyValue",
        name: "Purity",
        value: product.purity
      }
    ] : undefined,
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export function generateFaqSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }
}
