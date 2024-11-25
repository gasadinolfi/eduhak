import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { quizQuestionsSchema } from '@/lib/schema'

export async function POST(req: Request) {
  const { questionNumber } = await req.json()
  
  const prompt = `Genera ${questionNumber} preguntas de opción múltiple sobre conceptos básicos de drones, UAS, y RPAS. 
  Cada pregunta debe tener 4 opciones de respuesta y una única respuesta correcta.
  Las preguntas deben ser desafiantes y cubrir diferentes aspectos como definiciones, componentes y regulaciones.
  La respuesta correcta debe ser el índice (0-3) de la opción correcta.`

  try {
    const { object } = await generateObject({
      model: groq('mixtral-8x7b-32768'),
      schema: quizQuestionsSchema,
      prompt,
      temperature: 0.7,
    })

    return Response.json(object)
  } catch (error) {
    console.error('Error generating questions:', error)
    return Response.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}

