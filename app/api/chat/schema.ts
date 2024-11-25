import { z } from "zod";

export const questionSchema = z.object({
  text: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export const quizQuestionsSchema = z.object({
  questions: z.array(questionSchema),
});

export type Question = z.infer<typeof questionSchema>;
export type QuizQuestions = z.infer<typeof quizQuestionsSchema>;

