import { NextResponse } from "next/server"
import { validateDiscountCode, applyDiscount } from "@/lib/discount-service"

export async function POST(request: Request) {
  try {
    const { code, subtotal, customerEmail } = await request.json()

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "Invalid request. Code and subtotal are required." }, { status: 400 })
    }

    // Validate the discount code
    const validationResult = await validateDiscountCode(code, subtotal, customerEmail)

    if (!validationResult.isValid || !validationResult.discount) {
      return NextResponse.json(
        {
          isValid: false,
          error: validationResult.error || "Invalid discount code",
        },
        { status: 200 },
      )
    }

    // Apply the discount
    const discountResult = applyDiscount(validationResult.discount, subtotal)

    return NextResponse.json({
      isValid: true,
      discount: validationResult.discount,
      discountAmount: discountResult.discountAmount,
      total: discountResult.total,
    })
  } catch (error) {
    console.error("Error validating discount:", error)
    return NextResponse.json({ error: "An error occurred while validating the discount code" }, { status: 500 })
  }
}
