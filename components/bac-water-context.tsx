'use client'

import { createContext, useContext, useState } from "react"

interface BacWaterContextType {
  includeBacWater: boolean
  setIncludeBacWater: (include: boolean) => void
}

const BacWaterContext = createContext<BacWaterContextType | undefined>(undefined)

export function BacWaterProvider({ children }: { children: React.ReactNode }) {
  const [includeBacWater, setIncludeBacWater] = useState(true) // Start checked

  return (
    <BacWaterContext.Provider value={{ includeBacWater, setIncludeBacWater }}>
      {children}
    </BacWaterContext.Provider>
  )
}

export function useBacWater() {
  const context = useContext(BacWaterContext)
  if (context === undefined) {
    // Return default values instead of throwing error
    return {
      includeBacWater: false,
      setIncludeBacWater: () => {}
    }
  }
  return context
}
