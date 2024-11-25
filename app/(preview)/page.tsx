'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { experimental_useObject as useObject } from 'ai/react'
import { quizQuestionsSchema } from '@/lib/schema'
import { Loader2 } from 'lucide-react'

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  const { object: questionsData, submit: loadQuestions, isLoading, error } = useObject({
    api: '/api/chat',
    schema: quizQuestionsSchema,
  })

  const handleAnswer = (index: number) => {
    if (!answered && questionsData?.questions[currentQuestionIndex]) {
      setAnswered(true)
      if (index === questionsData.questions[currentQuestionIndex].correctAnswer) {
        setScore(prev => prev + 1)
      }
      
      setTimeout(() => {
        if (currentQuestionIndex < questionsData.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1)
          setAnswered(false)
        }
      }, 1500)
    }
  }

  const startQuiz = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswered(false)
    loadQuestions({ questionNumber: 3 })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Generando preguntas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Error al generar las preguntas</p>
        <Button onClick={startQuiz}>Intentar de nuevo</Button>
      </div>
    )
  }

  if (!questionsData?.questions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Cuestionario de Drones</h1>
        <Button onClick={startQuiz}>Comenzar</Button>
      </div>
    )
  }

  const currentQuestion = questionsData.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            Pregunta {currentQuestionIndex + 1} de {questionsData.questions.length}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Puntuación: {score}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg font-medium mb-4">{currentQuestion.text}</p>
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  variant={
                    answered
                      ? index === currentQuestion.correctAnswer
                        ? "default"
                        : "outline"
                      : "outline"
                  }
                  className={`justify-start h-auto py-4 px-6 text-left ${
                    answered && index === currentQuestion.correctAnswer
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : ""
                  }`}
                  disabled={answered}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

