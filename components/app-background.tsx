"use client"

import React from "react"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"

export function AppBackground() {
  return <BackgroundRippleEffect rows={12} cols={30} cellSize={48} />
}
