import { NextRequest, NextResponse } from "next/server"
import { getCustomTemplates, saveTemplate, updateTemplate, deleteTemplate } from "@/lib/sms-templates"

// GET - Fetch all custom templates
export async function GET() {
  try {
    const templates = await getCustomTemplates()
    
    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const { name, message, category } = await request.json()

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Template name must be 100 characters or less" },
        { status: 400 }
      )
    }

    const template = await saveTemplate({
      name: name.trim(),
      message: message.trim(),
      category: category || 'Custom'
    })

    return NextResponse.json({
      success: true,
      template,
      message: "Template saved successfully"
    })

  } catch (error) {
    console.error("Error saving template:", error)
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    )
  }
}

// PUT - Update existing template
export async function PUT(request: NextRequest) {
  try {
    const { id, name, message, category } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name.trim()
    if (message !== undefined) updates.message = message.trim()
    if (category !== undefined) updates.category = category

    const template = await updateTemplate(id, updates)

    return NextResponse.json({
      success: true,
      template,
      message: "Template updated successfully"
    })

  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    )
  }
}

// DELETE - Remove template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    await deleteTemplate(id)

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    )
  }
}
