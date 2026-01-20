import { NextRequest, NextResponse } from "next/server"
import { createClientSafe } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type StockOverrideRecord = {
  product_id: string
  hide_stock: boolean | null
  domestic_all: boolean | null
  international_all: boolean | null
  size_overrides: any
  updated_at: string | null
}

function toApiRecord(row: StockOverrideRecord) {
  return {
    productId: row.product_id,
    hideStock: row.hide_stock ?? false,
    domesticAll: row.domestic_all ?? null,
    internationalAll: row.international_all ?? null,
    sizeOverrides: (row.size_overrides as Record<string, any>) || {},
    updatedAt: row.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClientSafe()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    let query = supabase
      .from("product_stock_overrides")
      .select("product_id, hide_stock, domestic_all, international_all, size_overrides, updated_at")

    if (productId) {
      query = query.eq("product_id", productId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching stock overrides:", error)
      return NextResponse.json({ error: "Failed to fetch stock overrides" }, { status: 500 })
    }

    const list = (data || []).map((r: any) => toApiRecord(r))
    return NextResponse.json({
      overrides: list,
      override: productId ? (list[0] || null) : undefined,
    })
  } catch (error) {
    console.error("Error in GET /api/stock-overrides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClientSafe()

    const body = await request.json()
    const { productId, hideStock, domesticAll, internationalAll, sizeOverrides } = body || {}

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const payload = {
      product_id: productId,
      hide_stock: typeof hideStock === "boolean" ? hideStock : null,
      domestic_all: typeof domesticAll === "boolean" ? domesticAll : null,
      international_all: typeof internationalAll === "boolean" ? internationalAll : null,
      size_overrides: (sizeOverrides && typeof sizeOverrides === "object") ? sizeOverrides : {},
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("product_stock_overrides")
      .upsert(payload, { onConflict: "product_id" })
      .select("product_id, hide_stock, domestic_all, international_all, size_overrides, updated_at")
      .single()

    if (error) {
      console.error("Error updating stock overrides:", error)
      return NextResponse.json({ error: "Failed to update stock overrides" }, { status: 500 })
    }

    return NextResponse.json({ override: toApiRecord(data as any) })
  } catch (error) {
    console.error("Error in PUT /api/stock-overrides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClientSafe()

    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("product_stock_overrides")
      .delete()
      .eq("product_id", productId)

    if (error) {
      console.error("Error deleting stock overrides:", error)
      return NextResponse.json({ error: "Failed to delete stock overrides" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/stock-overrides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
