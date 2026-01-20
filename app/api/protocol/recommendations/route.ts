import { NextRequest, NextResponse } from 'next/server'
import { generatePeptideRecommendations } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { goal, answers } = await request.json()

    if (!goal || !answers) {
      return NextResponse.json(
        { error: 'Goal and answers are required' },
        { status: 400 }
      )
    }

    const recommendations = await generatePeptideRecommendations(goal, answers)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
