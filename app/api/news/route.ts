import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: news, error } = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching news:", error)
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
    }

    return NextResponse.json({ news })
  } catch (error) {
    console.error("Error in GET /api/news:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
