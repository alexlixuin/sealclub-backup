import { NextRequest, NextResponse } from "next/server"

// Uses OpenAI via fetch (no extra dependency)
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const MODEL = "gpt-4o"

function buildPrompt(numbers: string[]) {
  return `You are given a list of phone numbers in E.164 or near-E.164 format. For each number, infer the country name based ONLY on its dialing prefix. If the prefix maps to multiple countries (e.g., +1), choose the most likely broad country name ("United States") unless the local formatting strongly indicates another.

Return STRICT JSON with this schema and nothing else:
{
  "items": [
    { "phone_number": "+123...", "country_name": "Country Name or Unknown" }
  ]
}

Numbers:\n${numbers.join("\n")}`
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 })
    }

    const { numbers } = await request.json()
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json({ error: "numbers array is required" }, { status: 400 })
    }

    const prompt = buildPrompt(numbers)

    const resp = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a precise JSON generator." },
          { role: "user", content: prompt }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error("OpenAI error:", text)
      return NextResponse.json({ error: "OpenAI request failed" }, { status: 500 })
    }

    const data = await resp.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: "No content from OpenAI" }, { status: 500 })
    }

    let parsed: { items: { phone_number: string; country_name: string }[] }
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      console.error("Failed to parse OpenAI JSON:", e, content)
      return NextResponse.json({ error: "Invalid JSON from OpenAI" }, { status: 500 })
    }

    const items = Array.isArray(parsed.items) ? parsed.items : []

    // Compute statistics
    const countryStatistics = items.reduce((acc: Record<string, number>, it) => {
      const name = it.country_name || "Unknown"
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      items,
      countryStatistics
    })
  } catch (error) {
    console.error("ai-country-stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
