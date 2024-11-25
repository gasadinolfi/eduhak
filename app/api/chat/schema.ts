import { z } from "zod";

export const questionSchema = z.object({
  text: z.string().describe("The text of the question"),
  options: z.array(z.string()).min(2).describe("An array of possible answers"),
  correctAnswer: z.number().int().min(0).describe("The index of the correct answer in the options array"),
});

export const quizQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1).describe("An array of questions for the quiz"),
});

export type Question = z.infer<typeof questionSchema>;
export type QuizQuestions = z.infer<typeof quizQuestionsSchema>;