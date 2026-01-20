import { type NextRequest, NextResponse } from "next/server"
import { products } from "@/lib/products"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      products: products,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract product data from form
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      categorySlug: formData.get("categorySlug") as string,
      categoryIds: JSON.parse(formData.get("categoryIds") as string),
      quantity: formData.get("quantity") as string,
      chemicalName: (formData.get("chemicalName") as string) || undefined,
      casNumber: (formData.get("casNumber") as string) || undefined,
      concentration: (formData.get("concentration") as string) || undefined,
      purity: (formData.get("purity") as string) || undefined,
      storage: (formData.get("storage") as string) || undefined,
      halfLife: (formData.get("halfLife") as string) || undefined,
      molecularFormula: (formData.get("molecularFormula") as string) || undefined,
      molecularWeight: (formData.get("molecularWeight") as string) || undefined,
      featured: formData.get("featured") === "true",
      new: formData.get("new") === "true",
      bestSeller: formData.get("bestSeller") === "true",
      sizeOptions: JSON.parse((formData.get("sizeOptions") as string) || "[]"),
    }

    // Handle image upload (in a real app, you'd upload to a storage service)
    const imageFile = formData.get("image") as File
    let imagePath = "/images/placeholder.png"

    if (imageFile) {
      // In a real implementation, you would:
      // 1. Upload the image to a storage service (AWS S3, Cloudinary, etc.)
      // 2. Get the URL back
      // 3. Store that URL in the database
      // For now, we'll use a placeholder
      imagePath = "/images/placeholder.png"
    }

    // Generate product ID (in a real app, this would be handled by the database)
    const productId = productData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")

    const newProduct = {
      id: productId,
      ...productData,
      category: productData.categorySlug,
      image: imagePath,
      relatedProducts: [],
    }

    // In a real application, you would save this to a database
    // For now, we'll just return success
    console.log("New product created:", newProduct)

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: "Product created successfully",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
