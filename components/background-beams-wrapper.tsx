"use client"

import dynamic from "next/dynamic"

const BackgroundBeamsSection = dynamic(() => import("@/components/background-beams-section"), {
  ssr: false,
  loading: () => null,
})

export default function BackgroundBeamsWrapper() {
  return <BackgroundBeamsSection />
}
