import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a function to get the regular supabase client (browser-only)
export function getSupabase() {
  if (typeof window === "undefined") {
    throw new Error("getSupabase() should only be called in the browser")
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient(url, anonKey)
}

// Create browser client (only works client-side)
export const supabase = typeof window !== "undefined" ? getSupabase() : null

// Create admin client function (server-side only)
export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("Admin client can only be used on server-side")
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createClient() {
  console.log("[v0] createClient called, checking context...")

  try {
    if (typeof window === "undefined") {
      // Server-side: use admin client
      console.log("[v0] Server-side context detected, using admin client")
      return getSupabaseAdmin()
    } else {
      // Client-side: use regular client
      console.log("[v0] Client-side context detected, using regular client")
      return getSupabase()
    }
  } catch (error) {
    console.error("[v0] createClient error:", error)
    return null
  }
}

export function createClientSafe() {
  const client = createClient()
  if (!client) {
    throw new Error("Failed to create Supabase client")
  }
  return client
}

// Types for our database tables
export type CheckoutLog = {
  id: number
  event: string
  data: any
  created_at: string
}
