"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, cubicBezier } from "framer-motion"
import type { Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  Home,
  LayoutDashboard,
  HelpCircle,
  Mail,
  Info,
  ShoppingBag,
  User,
  Heart,
  Settings,
  Users,
  Download,
  Wifi,
  WifiOff,
  Truck,
  Star,
  Gift,
} from "lucide-react"

interface MobileNavigationProps {
  categories: {
    title: string
    href: string
    description: string
  }[]
}

export default function MobileNavigation({ categories }: MobileNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | false>("categories")
  const [isOnline, setIsOnline] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const navigateTo = (href: string) => {
    router.push(href)
  }

  useEffect(() => {
    // Check if app is in standalone mode (PWA)
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    // Network status detection
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("PWA installed")
    }

    setDeferredPrompt(null)
  }

  // Animation variants for menu items
  // Framer Motion easing and variants (typed)
  const easeOutCustom = cubicBezier(0.25, 0.46, 0.45, 0.94)

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeOutCustom,
      },
    },
  }

  const staggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-col h-full text-foreground overflow-hidden">
      {/* Logo and header section */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-dashed border-border/60 backdrop-blur-sm bg-background/80">
        <div onClick={() => navigateTo("/")} className="flex items-center gap-3 cursor-pointer">
          <div className="bg-white rounded-full p-1.5 shadow-sm">
            <Image
              src="/images/logo-ozptides-transparent.png"
              alt="OZPTides Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </div>
          <span className="font-bold text-xl gradient-text">OZPTides</span>
        </div>
        <SheetClose asChild>
          <Button variant="ghost" size="sm" className="rounded-full hover:bg-secondary/50">
            Close
          </Button>
        </SheetClose>
      </div>

      {/* PWA Status and Install */}
      <div className="px-4 py-2 border-b border-dashed border-border/60">
        <div className="flex items-center justify-between">
          {/* Network Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Offline</span>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          {!isStandalone && deferredPrompt && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleInstallPWA}
              className="text-xs px-2 py-1 h-7 bg-transparent"
            >
              <Download className="h-3 w-3 mr-1" />
              Install App
            </Button>
          )}

          {/* PWA Status */}
          {isStandalone && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-muted-foreground">PWA Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation content */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="space-y-4">
          {/* Categories accordion */}
          <div className="rounded-xl overflow-hidden backdrop-blur-sm bg-secondary/10">
            <Accordion
              type="single"
              value={expanded ? expanded : undefined}
              onValueChange={(value) => setExpanded(value || false)}
              className="border-0"
            >
              <AccordionItem value="categories" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-secondary/20 transition-all duration-200 rounded-t-xl">
                  <div className="flex items-center">
                    <LayoutDashboard className="mr-3 h-5 w-5 text-primary" />
                    <span className="font-medium">Categories</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-3 pt-1">
                  <div className="space-y-1 ml-8">
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible">
                      {categories.map((category) => (
                        <motion.div key={category.href} variants={itemVariants} className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-border/60 ml-[-4px]"></div>
                          <SheetClose asChild>
                            <div
                              onClick={() => navigateTo(category.href)}
                              className={cn(
                                "block py-2.5 px-3 rounded-lg transition-all duration-200 relative cursor-pointer",
                                "before:absolute before:left-[-8px] before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:border before:border-border/60",
                                pathname === category.href
                                  ? "bg-secondary/30 font-medium before:bg-primary before:border-primary"
                                  : "hover:bg-secondary/20 before:bg-background",
                              )}
                            >
                              {category.title}
                            </div>
                          </SheetClose>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Main navigation links */}
          <div className="rounded-xl overflow-hidden backdrop-blur-sm bg-secondary/10 border border-dashed border-border/40">
            <nav className="divide-y divide-dashed divide-border/40">
              <motion.div variants={staggerVariants} initial="hidden" animate="visible">
                {[
                  { href: "/", label: "Home", icon: Home },
                  { href: "/about", label: "About", icon: Info },
                  { href: "/faq", label: "FAQ", icon: HelpCircle },
                  { href: "/contact", label: "Contact", icon: Mail },
                  { href: "/partners", label: "Partners", icon: Users },
                  { href: "/next-day-delivery", label: "Next Day Delivery", icon: Truck },
                  { href: "/get-your-protocol", label: "Get your FREE Routine", icon: Star },
                  { href: "/survey", label: "FREE Discount Survey", icon: Gift },
                  { href: "/cart", label: "Cart", icon: ShoppingBag },
                ].map((item) => (
                  <motion.div key={item.href} variants={itemVariants}>
                    <SheetClose asChild>
                      <div
                        onClick={() => navigateTo(item.href)}
                        className={cn(
                          "flex items-center py-3 px-4 transition-all duration-200 cursor-pointer",
                          pathname === item.href ? "bg-secondary/30 font-medium" : "hover:bg-secondary/20",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5",
                            pathname === item.href ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        {item.label}
                      </div>
                    </SheetClose>
                  </motion.div>
                ))}
              </motion.div>
            </nav>
          </div>

          {/* Account section */}
          <div className="rounded-xl overflow-hidden backdrop-blur-sm bg-secondary/10 border border-dashed border-border/40">
            <div className="py-2 px-4 border-b border-dashed border-border/40">
              <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
            </div>
            <nav className="divide-y divide-dashed divide-border/40">
              <motion.div variants={staggerVariants} initial="hidden" animate="visible">
                {[
                  { href: "/account", label: "My Account", icon: User },
                  { href: "/wishlist", label: "Wishlist", icon: Heart },
                  { href: "/settings", label: "Settings", icon: Settings },
                ].map((item) => (
                  <motion.div key={item.href} variants={itemVariants}>
                    <SheetClose asChild>
                      <div
                        onClick={() => navigateTo(item.href)}
                        className={cn(
                          "flex items-center py-3 px-4 transition-all duration-200 cursor-pointer",
                          pathname === item.href ? "bg-secondary/30 font-medium" : "hover:bg-secondary/20",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5",
                            pathname === item.href ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        {item.label}
                      </div>
                    </SheetClose>
                  </motion.div>
                ))}
              </motion.div>
            </nav>
          </div>
        </div>
      </div>

      {/* Footer section */}
      <div className="mt-auto p-4 text-center text-sm text-muted-foreground border-t border-dashed border-border/60 backdrop-blur-sm bg-background/80">
        <p> 2024 OZPTides</p>
        <p className="text-xs mt-1">Research Chemicals Only</p>
      </div>
    </div>
  )
}
