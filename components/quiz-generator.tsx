"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuizQuestions, Question } from '@/lib/schema'

export function QuizGenerator() {
  const [questionNumber, setQuestionNumber] = useState(5)
  const [questions, setQuestions] = useState<QuizQuestions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionNumber }),
      })
      if (!response.ok) {
        throw new Error('Error al generar preguntas')
      }
      const data: QuizQuestions = await response.json()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Generador de Preguntas de Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={questionNumber}
            onChange={(e) => setQuestionNumber(Number(e.target.value))}
            min={1}
            max={10}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generando...' : 'Generar Preguntas'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}

        {questions && (
          <div className="space-y-4">
            {questions.questions.map((question: Question, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-2">Pregunta {index + 1}</h3>
                  <p className="mb-2">{question.text}</p>
                  <ul className="list-disc pl-5 mb-2">
                    {question.options.map((option, optionIndex) => (
                      <li key={optionIndex} className={optionIndex === question.correctAnswer ? "font-bold" : ""}>
                        {option}
                      </li>
                    ))}
                  </ul>
                  {question.explanation && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Explicación:</span> {question.explanation}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

