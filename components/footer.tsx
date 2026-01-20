import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-full p-2 mb-4">
            <Image src="/images/logo-ozptides-transparent.png" alt="SealClub Beauty Logo" width={60} height={60} />
          </div>
          <h2 className="text-2xl font-bold gradient-text">SealClub Beauty</h2>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            Clinical-luxury skincare and wellness supplements crafted for luminous skin and daily balance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4 sm:space-y-2">
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/category/sarms" className="text-muted-foreground hover:text-foreground">
                  SARMs
                </Link>
              </li>
              <li>
                <Link href="/category/peptides-muscle" className="text-muted-foreground hover:text-foreground">
                  Peptides
                </Link>
              </li>
              <li>
                <Link href="/category/growth-hormone" className="text-muted-foreground hover:text-foreground">
                  Growth Hormone
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4 sm:space-y-2">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4 sm:space-y-2">
            <h3 className="text-lg font-semibold mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-muted-foreground hover:text-foreground">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign up for our newsletter to receive updates and special offers.
            </p>
            <div className="mt-2 flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-l-md border border-r-0 bg-background px-3 py-2 text-sm"
              />
              <button className="rounded-r-md border border-primary bg-primary px-3 py-2 text-sm text-primary-foreground">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} SealClub Beauty. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-left">
              Premium skincare and wellness supplements. For external and dietary use as directed.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
