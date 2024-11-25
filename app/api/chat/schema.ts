import { DeepPartial } from "ai";
import { z } from "zod";

const questionSchema = z.object({
  text: z.string().describe("Texto de la pregunta sobre drones"),
  options: z.array(z.string()).describe("Opciones de respuesta"),
  correctAnswer: z.number().describe("Índice de la respuesta correcta (0-3)"),
});

export const quizQuestionsSchema = z.object({
  questions: z.array(questionSchema).length(10),
});

// define a type for the partial notifications during generation
export type PartialQuestions = DeepPartial<typeof quizQuestionsSchema>["questions"];

export type Question = z.infer<typeof questionSchema>;

