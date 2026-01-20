import type React from "react"
import type { AddressType } from "@/lib/types"
import { addressToString } from "@/lib/address-utils"

interface AddressDisplayProps {
  address: AddressType | string | null | undefined
  className?: string
}

export function AddressDisplay({ address, className = "" }: AddressDisplayProps): React.ReactElement {
  console.log("AddressDisplay received:", address)

  // Handle null or undefined
  if (!address) {
    console.log("AddressDisplay: address is null or undefined")
    return <p className={`text-gray-500 ${className}`}>No address provided</p>
  }

  try {
    // If it's a string that looks like an address string, split by newlines
    if (typeof address === "string") {
      console.log("AddressDisplay: address is a string")
      const lines = address.split("\n")

      // If it's an empty string or just whitespace
      if (!address.trim()) {
        return <p className={`text-gray-500 ${className}`}>No address provided</p>
      }

      return (
        <div className={className}>
          {lines.map((line, index) => (
            <div key={`address-line-${index}`}>{line}</div>
          ))}
        </div>
      )
    }

    // If it's an object, convert to string first
    console.log("AddressDisplay: address is an object, converting to string")
    const addressString = addressToString(address)
    console.log("AddressDisplay: converted to string:", addressString)

    // If the conversion resulted in an empty string or just a placeholder
    if (!addressString.trim() || addressString === "No address details" || addressString === "No address provided") {
      return <p className={`text-gray-500 ${className}`}>No address provided</p>
    }

    const lines = addressString.split("\n")

    return (
      <div className={className}>
        {lines.map((line, index) => (
          <div key={`address-line-${index}`}>{line}</div>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error rendering address:", error)
    return <p className={`text-gray-500 ${className}`}>Error displaying address</p>
  }
}
