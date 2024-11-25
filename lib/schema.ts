import { z } from "zod";

export const questionSchema = z.object({
  text: z.string().describe("El texto de la pregunta"),
  options: z.array(z.string()).describe("Un array de opciones de respuesta posibles"),
  correctAnswer: z.number().min(0).describe("El índice de la respuesta correcta en el array de opciones"),
  explanation: z.string().optional().describe("Una explicación opcional para la respuesta correcta")
});

export const quizQuestionsSchema = z.object({
  questions: z.array(questionSchema).describe("Un array de preguntas del quiz")
});

export type Question = z.infer<typeof questionSchema>;
export type QuizQuestions = z.infer<typeof quizQuestionsSchema>;

