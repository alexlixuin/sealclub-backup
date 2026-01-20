import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/components/cart-provider"
import { BacWaterReminder } from "@/components/bac-water-reminder"
import { Toaster } from "@/components/ui/toaster"
import { ScrollingBanner } from "@/components/scrolling-banner"
import { DiscountBanner } from "@/components/discount-banner"
import { CrispChat } from "@/components/crisp-chat"
import { PWAIntegration } from "@/components/pwa-integration"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import { PerformanceLayout } from "@/components/performance-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SealClub Beauty",
  description: "SealClub Beauty - Premium skincare and wellness supplements",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com",
    title: "SealClub Beauty",
    description: "SealClub Beauty - Premium skincare and wellness supplements",
    siteName: "SealClub Beauty",
    images: [
      {
        url: "/og-image.png",
        width: 800,
        height: 600,
        alt: "SealClub Beauty",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sealclubbeauty",
    creator: "@sealclubbeauty",
    title: "SealClub Beauty",
    description: "SealClub Beauty - Premium skincare and wellness supplements",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  themeColor: "#3b82f6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SealClub Beauty",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com",
    logo: "/logo.png",
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SealClub Beauty",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com"}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://ozptides.com"} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta property="og:locale" content="en_AU" />
        <meta name="geo.region" content="AU" />
        <meta name="geo.placename" content="Australia" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://client.crisp.chat" />
        <link rel="preconnect" href="https://storage.crisp.chat" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://client.crisp.chat" />
        <link rel="dns-prefetch" href="https://storage.crisp.chat" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />

        {/* iOS PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SealClub Beauty" />

        {/* Windows PWA Support */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <CartProvider>
          <PerformanceLayout>
            <Suspense fallback={null}>
              <div className="flex min-h-screen flex-col prevent-overflow relative z-10">
                <ScrollingBanner
                  text="CLINICAL-LUXURY SKINCARE &nbsp; • &nbsp; MELBOURNE STUDIO DISPATCH &nbsp; • &nbsp; 2 DAY AU/NZ &nbsp; • &nbsp; 10 DAY WORLDWIDE SHIPPING"
                  className="text-xs font-medium text-muted-foreground"
                />
                <DiscountBanner />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
              <BacWaterReminder />
              <CrispChat />
              <PWAIntegration />
              <Analytics />
              <SpeedInsights />
            </Suspense>
          </PerformanceLayout>
        </CartProvider>
      </body>
    </html>
  )
}
