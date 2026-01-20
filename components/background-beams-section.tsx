"use client"

import React from "react"
import { BackgroundBeams } from "@/components/ui/background-beams"

const BackgroundBeamsSection = React.memo(() => {
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
      <BackgroundBeams className="opacity-30" />
    </div>
  )
})

BackgroundBeamsSection.displayName = "BackgroundBeamsSection"

export default BackgroundBeamsSection
