"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

const World = dynamic(() => import("@/components/ui/globe").then((mod) => mod.World), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] w-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading interactive globe...</p>
      </div>
    </div>
  ),
})

export function GlobeSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Worldwide Shipping Network</h2>
              <p className="text-lg text-muted-foreground">
                Experience our global reach with dual dispatch centers designed to deliver skincare and wellness
                essentials worldwide.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Australia Dispatch Center</h3>
                  <p className="text-muted-foreground">
                    Serving Asia-Pacific region with express delivery to Australia, New Zealand, and Southeast Asia.
                    Average delivery: 2-5 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">China Dispatch Center</h3>
                  <p className="text-muted-foreground">
                    Global distribution hub covering North America, Europe, and worldwide destinations. Average
                    delivery: 7-14 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Real-time tracking available for all shipments</span>
              </div>
            </div>
          </div>

          {/* Globe Side */}
          <div className="relative h-[500px] w-full">
            {isVisible && (
              <World
                data={[
                  {
                    order: 1,
                    startLat: -33.8688,
                    startLng: 151.2093,
                    endLat: 40.7128,
                    endLng: -74.006,
                    arcAlt: 0.2,
                    color: "#3b82f6",
                  },
                  {
                    order: 2,
                    startLat: 39.9042,
                    startLng: 116.4074,
                    endLat: 51.5074,
                    endLng: -0.1278,
                    arcAlt: 0.2,
                    color: "#10b981",
                  },
                  {
                    order: 3,
                    startLat: 39.9042,
                    startLng: 116.4074,
                    endLat: 49.2827,
                    endLng: -123.1207,
                    arcAlt: 0.2,
                    color: "#10b981",
                  },
                ]}
                globeConfig={{
                  pointSize: 3,
                  globeColor: "#1d1d1d",
                  showAtmosphere: true,
                  atmosphereColor: "#ffffff",
                  atmosphereAltitude: 0.1,
                  emissive: "#000000",
                  emissiveIntensity: 0.05,
                  shininess: 0.7,
                  polygonColor: "rgba(255,255,255,0.5)",
                  ambientLight: "#ffffff",
                  directionalLeftLight: "#ffffff",
                  directionalTopLight: "#ffffff",
                  pointLight: "#ffffff",
                  arcTime: 2000,
                  arcLength: 0.7,
                  rings: 1,
                  maxRings: 2,
                  initialPosition: { lat: 22.3193, lng: 114.1694 },
                  autoRotate: true,
                  autoRotateSpeed: 0.3,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
