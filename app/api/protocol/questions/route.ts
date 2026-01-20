import { NextRequest, NextResponse } from 'next/server'
import { generateQuestionsForGoal } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { goal } = await request.json()

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      )
    }

    const questions = await generateQuestionsForGoal(goal)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
