import { groq } from '@ai-sdk/groq';
import { streamObject } from "ai";
import { z } from 'zod';

export const maxDuration = 305; // Increased maximum execution time

// Define the schema for quiz questions using Zod
const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().int().min(0).max(3)
});

const QuizQuestionsSchema = z.array(QuestionSchema).length(10);

export async function POST(req: Request) {
  const { messages } = await req.json();
  const contexto = messages[messages.length - 1].content;

  const result = await streamObject({
    model: groq("llama-3.1-70b-versatile"),
    messages: [
      {
        role: "system",
        content: "Eres un generador de preguntas especializado en la creación de preguntas de opción múltiple de alta dificultad basadas en el contenido proporcionado. Genera preguntas que abarquen diferentes aspectos como definiciones, componentes, procedimientos, y regulaciones descritas en el texto. Cada pregunta debe ser única, tanto en su enfoque como en las opciones de respuesta. Asegúrate de que no haya repetición de preguntas ni de opciones entre ellas."
      },
      {
        role: "user",
        content: `Genera 10 preguntas sobre el siguiente contexto: ${contexto}`
      }
    ],
    schema: QuizQuestionsSchema,
    onFinish({ object }) {
      // Here you could save the generated questions to a database if needed
      console.log("Questions generated successfully:", object);
    },
  });

  return new Response(result, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

