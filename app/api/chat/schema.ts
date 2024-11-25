import { z } from 'zod';

export const questionSchema = z.object({
  text: z.string().describe('The question text'),
  options: z.array(z.string()).describe('An array of 4 answer options'),
  correctAnswer: z.number().min(0).max(3).describe('The index of the correct answer (0-3)'),
});

export const quizQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1).max(10),
});

export type Question = z.infer<typeof questionSchema>;
export type QuizQuestions = z.infer<typeof quizQuestionsSchema>;

