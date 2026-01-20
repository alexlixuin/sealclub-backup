import OpenAI from 'openai'
import { getAllProductNames } from './products'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ProtocolQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'number'
  options?: string[]
  placeholder?: string
}

export interface ProtocolRecommendation {
  productIds: string[]
  reasoning: string
  summary: string
}

export async function generateQuestionsForGoal(goal: string): Promise<ProtocolQuestion[]> {
  const productNames = getAllProductNames()
  
  const prompt = `You are an expert peptide researcher helping users create personalized research protocols. 

Goal selected: "${goal}"

Generate exactly 4 questions to gather information for the best peptide recommendations:
- 2 questions should be general/goal-specific 
- 2 questions should be specific/tailored to get maximum accuracy for recommendations

Available peptides in our catalog:
${productNames.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')}

Return a JSON array of exactly 4 questions with this structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Your question text here",
      "type": "text|select|number",
      "options": ["option1", "option2"] // only if type is "select"
      "placeholder": "placeholder text" // optional
    }
  ]
}

Make questions practical and focused on getting the best peptide recommendations. Avoid medical advice - focus on research goals and preferences.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Clean the response to extract JSON from markdown code blocks
    const cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleanedResponse)
    return parsed.questions
  } catch (error) {
    console.error('Error generating questions:', error)
    // Fallback questions
    return [
      {
        id: "q1",
        question: "What is your primary research objective with peptides?",
        type: "text",
        placeholder: "Describe your main research goal..."
      },
      {
        id: "q2", 
        question: "What is your experience level with peptide research?",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced", "Professional Researcher"]
      },
      {
        id: "q3",
        question: "How long do you plan to conduct this research?",
        type: "select", 
        options: ["1-3 months", "3-6 months", "6-12 months", "Long-term (1+ years)"]
      },
      {
        id: "q4",
        question: "Do you have any specific peptides you're already interested in?",
        type: "text",
        placeholder: "List any specific peptides or leave blank..."
      }
    ]
  }
}

export async function generatePeptideRecommendations(
  goal: string, 
  answers: Record<string, string>
): Promise<ProtocolRecommendation> {
  const productNames = getAllProductNames()
  
  const prompt = `You are an expert peptide researcher. Based on the user's goal and answers, recommend the best peptides from our catalog.

Goal: "${goal}"

User Answers:
${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

Available peptides in our catalog:
${productNames.map(p => `- ${p.name} (ID: ${p.id}, Aliases: ${p.aliases.join(', ')})`).join('\n')}

IMPORTANT: You must ONLY recommend peptides that exist in our catalog above. Use the exact product IDs provided.

Return a JSON response with this structure:
{
  "productIds": ["product-id-1", "product-id-2", "product-id-3"],
  "reasoning": "Detailed explanation of why these peptides were chosen based on the user's goal and answers",
  "summary": "Brief summary of the recommended protocol approach"
}

Recommend 2-5 peptides maximum. Focus on synergistic combinations that align with the research goal. Be specific about why each peptide fits their objectives.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    // Clean the response to extract JSON from markdown code blocks
    const cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleanedResponse)
    
    // Validate that all recommended product IDs exist
    const validProductIds = productNames.map(p => p.id)
    const validRecommendations = parsed.productIds.filter((id: string) => 
      validProductIds.includes(id)
    )

    return {
      productIds: validRecommendations,
      reasoning: parsed.reasoning,
      summary: parsed.summary
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    // Fallback recommendation
    return {
      productIds: [productNames[0]?.id || ''].filter(Boolean),
      reasoning: "Unable to generate personalized recommendations at this time. Please try again or contact support.",
      summary: "Default recommendation provided due to system error."
    }
  }
}
