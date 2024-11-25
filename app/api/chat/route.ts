import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { quizQuestionsSchema } from '@/lib/schema'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(req: Request) {
  const { questionNumber } = await req.json()
  
  const prompt = `Genera ${questionNumber} preguntas de opción múltiple sobre conceptos básicos de drones, UAS, y RPAS. 
  Cada pregunta debe tener 4 opciones de respuesta y una única respuesta correcta.
  Las preguntas deben ser desafiantes y cubrir diferentes aspectos como definiciones, componentes y regulaciones.
  La respuesta correcta debe ser el índice (0-3) de la opción correcta.`

  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set')
    }

    const { object } = await generateObject({
      model: groq('llama-3.1-70b-versatile', GROQ_API_KEY),
      schema: quizQuestionsSchema,
      prompt,
      temperature: 0.7,
    })

    return Response.json(object)
  } catch (error) {
    console.error('Error generating questions:', error)
    return Response.json({ 
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

