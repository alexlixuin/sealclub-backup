import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: news, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching news:", error)
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
    }

    return NextResponse.json({ news })
  } catch (error) {
    console.error("Error in GET /api/admin/news:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const body = await request.json()
    const { title, content, excerpt, tags, status, priority } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const { data: news, error } = await supabase
      .from("news")
      .insert({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + "...",
        tags: typeof tags === 'string' ? tags.split(",").map((tag: string) => tag.trim()) : (tags || []),
        status: status || "draft",
        priority: priority || "normal",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating news:", error)
      return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
    }

    return NextResponse.json({ news }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/admin/news:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()

    const body = await request.json()
    const { id, title, content, excerpt, tags, status, priority } = body

    if (!id || !title || !content) {
      return NextResponse.json({ error: "ID, title and content are required" }, { status: 400 })
    }

    const { data: news, error } = await supabase
      .from("news")
      .update({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + "...",
        tags: typeof tags === 'string' ? tags.split(",").map((tag: string) => tag.trim()) : (tags || []),
        status: status || "draft",
        priority: priority || "normal",
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating news:", error)
      return NextResponse.json({ error: "Failed to update news" }, { status: 500 })
    }

    return NextResponse.json({ news })
  } catch (error) {
    console.error("Error in PUT /api/admin/news:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "News ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting news:", error)
      return NextResponse.json({ error: "Failed to delete news" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/news:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
