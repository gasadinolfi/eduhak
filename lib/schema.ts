import { z } from 'zod'

export const quizQuestionsSchema = z.object({
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
  }))
})

export type Question = z.infer<typeof quizQuestionsSchema>['questions'][number]

