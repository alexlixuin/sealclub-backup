import type { AddressType } from "./types"

/**
 * Convert an address object to a formatted string
 */
export function addressToString(addressData: any): string {
  // Log the input for debugging
  console.log("addressToString input:", JSON.stringify(addressData, null, 2))

  // Handle null or undefined
  if (!addressData) {
    console.log("addressToString: addressData is null or undefined")
    return "No address provided"
  }

  // If it's already a string, return it
  if (typeof addressData === "string") {
    console.log("addressToString: addressData is already a string")
    return addressData
  }

  try {
    // Extract address from different possible structures
    let address: AddressType = {}

    // Check if the address is nested in an 'address' property
    if (addressData.address && typeof addressData.address === "object") {
      console.log("addressToString: found nested address object")
      address = addressData.address
    }
    // Otherwise use the object directly if it has address-like properties
    else if (
      addressData.address ||
      addressData.city ||
      addressData.state ||
      addressData.zipCode ||
      addressData.country
    ) {
      console.log("addressToString: using direct address properties")
      address = addressData
    }

    // Build the address string
    const parts: string[] = []

    if (address.address) parts.push(address.address)

    // City, state, zip line
    let cityStateZip = ""
    if (address.city) cityStateZip += address.city
    if (address.state) {
      if (cityStateZip) cityStateZip += ", "
      cityStateZip += address.state
    }
    if (address.zipCode) {
      if (cityStateZip) cityStateZip += " "
      cityStateZip += address.zipCode
    }

    if (cityStateZip) parts.push(cityStateZip)
    if (address.country) parts.push(address.country)

    // If we have any parts, join them with newlines
    if (parts.length > 0) {
      const result = parts.join("\n")
      console.log("addressToString result:", result)
      return result
    }

    // If we have a method but no address parts, it might be a shipping method
    if (addressData.method) {
      console.log("addressToString: found shipping method")
      return `Shipping Method: ${addressData.method}`
    }

    // Fallback for empty address
    console.log("addressToString: no address details found")
    return "No address details"
  } catch (error) {
    console.error("Error formatting address:", error)
    return "Error formatting address"
  }
}

/**
 * Parse an address from various formats into a structured AddressType
 */
export function parseAddress(addressData: any): AddressType {
  console.log("parseAddress input:", JSON.stringify(addressData, null, 2))

  // Handle null or undefined
  if (!addressData) {
    console.log("parseAddress: addressData is null or undefined")
    return {}
  }

  try {
    // If it's a string, try to parse it as JSON
    if (typeof addressData === "string") {
      console.log("parseAddress: addressData is a string")
      try {
        addressData = JSON.parse(addressData)
      } catch (e) {
        // If it's not valid JSON, return an empty object
        console.log("parseAddress: failed to parse string as JSON")
        return {}
      }
    }

    // Check if the address is nested in an 'address' property
    if (addressData.address && typeof addressData.address === "object") {
      console.log("parseAddress: found nested address object")
      return {
        ...addressData.address,
        phone: addressData.phone || addressData.address.phone || "",
      }
    }

    // Otherwise extract address fields from the object directly
    console.log("parseAddress: using direct address properties")
    return {
      address: addressData.address || "",
      city: addressData.city || "",
      state: addressData.state || "",
      zipCode: addressData.zipCode || "",
      country: addressData.country || "",
      phone: addressData.phone || "",
    }
  } catch (error) {
    console.error("Error parsing address:", error)
    return {}
  }
}

// Add this alias to fix the import error
export const formatAddressString = addressToString
