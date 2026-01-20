import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { summary } = await request.json()

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json({ error: "Summary is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const prompt = `You are a professional content writer for OZPTides, an ecommerce platform selling research peptides and compounds. Based on the following summary, create engaging news content:

Summary: "${summary}"

Please generate:
1. A compelling, professional title (max 80 characters)
2. A brief excerpt/summary (max 200 characters) 
3. Full content (300-800 words) written in a professional, informative tone

The content should be:
- Professional and trustworthy
- Informative for customers
- Appropriate for an ecommerce news section
- Include relevant details while being engaging
- Use proper formatting with paragraphs

Format your response as JSON with these exact keys: "title", "excerpt", "content"`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer specializing in ecommerce news and customer communications. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    try {
      const aiContent = JSON.parse(responseText)
      
      // Validate the response structure
      if (!aiContent.title || !aiContent.excerpt || !aiContent.content) {
        throw new Error("Invalid AI response structure")
      }

      return NextResponse.json({
        title: aiContent.title,
        excerpt: aiContent.excerpt,
        content: aiContent.content
      })
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in AI enhance:", error)
    return NextResponse.json({ error: "Failed to enhance content" }, { status: 500 })
  }
}