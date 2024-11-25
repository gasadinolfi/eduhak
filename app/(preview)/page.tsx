'use client'

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Question } from "@/lib/schema"
import { Menu, BookOpen, BarChart, User, Settings, Trophy, ArrowRight, X, FileText, Bell, HelpCircle, MessageSquare, Play, Sun, Moon, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { experimental_useObject as useObject } from 'ai/react';
import { groq } from '@ai-sdk/groq'
import { quizQuestionsSchema } from "@/lib/schema"
import { HackathonIdeaGenerator } from "@/components/hackathon-idea-generator"

const groqProvider = groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
})

const QuestionView = ({ question, onAnswer, answered }: { question: Question, onAnswer: (index: number) => void, answered: boolean }) => {
  return (
    <motion.div
      className="w-full max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background border-none shadow-lg overflow-hidden">
        <CardHeader className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-2xl font-normal text-foreground">{question?.text}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {question?.options?.map((option, index) => (
              <Button
                key={index}
                onClick={() => onAnswer(index)}
                variant={answered ? (index === question.correctAnswer ? "default" : "outline") : "outline"}
                className={`justify-start h-auto py-4 px-6 text-left text-base font-normal transition-all ${
                  answered && index === question.correctAnswer
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : answered && index !== question.correctAnswer
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "hover:bg-secondary"
                } relative overflow-hidden group`}
                disabled={answered}
              >
                <span className="relative z-10">{option}</span>
                {answered && (
                  <motion.div
                    className={`absolute inset-0 ${
                      index === question.correctAnswer ? "bg-green-500" : "bg-red-500"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Sidebar = ({ userStats, currentQuiz, onSelectModule, onQuickStart }: { userStats: any, currentQuiz: any, onSelectModule: (module: string) => void, onQuickStart: () => void }) => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="w-12 h-12">
          <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Avatar del usuario" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">Usuario</p>
          <p className="text-sm text-muted-foreground">Estadísticas</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="font-medium">Cuestionarios Realizados: {userStats.quizzesTaken}</p>
          <p className="font-medium">Puntuación Promedio: {userStats.averageScore}%</p>
        </div>
        <div>
          <p className="font-medium">Cuestionario Actual</p>
          <p className="text-sm text-muted-foreground">Preguntas: {currentQuiz.totalQuestions}</p>
          <p className="text-sm text-muted-foreground">Pregunta Actual: {currentQuiz.currentQuestion}</p>
        </div>
      </div>
      <div className="mt-8">
        <Button onClick={onQuickStart} className="w-full">Comenzar Cuestionario</Button>
      </div>
    </div>
  )
}

const ModuleView = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="p-6">
      <Button onClick={onClose} className="absolute top-4 right-4">Cerrar</Button>
      <h2 className="text-2xl font-bold mb-4">Módulos</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Módulo 1: Introducción a los Drones</li>
        <li>Módulo 2: Tipos de Drones</li>
        <li>Módulo 3: Regulaciones de Drones</li>
      </ul>
    </div>
  )
}

const ResultModal = ({ isOpen, onClose, score, totalQuestions, onRetry }: { isOpen: boolean, onClose: () => void, score: number, totalQuestions: number, onRetry: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        <h2 className="text-2xl font-bold mb-4">Resultados</h2>
        <p className="text-lg mb-4">Tu puntuación: {score} de {totalQuestions}</p>
        <p className="text-lg mb-4">Porcentaje: {Math.round((score / totalQuestions) * 100)}%</p>
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline" className="mr-2">Cerrar</Button>
          <Button onClick={onRetry}>Reintentar</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}


export default function Home() {
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [answered, setAnswered] = useState<boolean>(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showResultModal, setShowResultModal] = useState<boolean>(false)
  const [userStats, setUserStats] = useState({ quizzesTaken: 0, averageScore: 0 })
  const [showSidebar, setShowSidebar] = useState<boolean>(false)
  const [previousQuestions, setPreviousQuestions] = useState<Question[]>([])
  const [showModules, setShowModules] = useState<boolean>(false)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [showTutorial, setShowTutorial] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { complete } = useObject({
    model: groqProvider("llama-3.1-70b-versatile"),
    schema: quizQuestionsSchema,
    initialInput: "",
  })

  useEffect(() => {
    const storedStats = localStorage.getItem('userStats')
    if (storedStats) {
      setUserStats(JSON.parse(storedStats))
    }
    const storedQuestions = localStorage.getItem('previousQuestions')
    if (storedQuestions) {
      setPreviousQuestions(JSON.parse(storedQuestions))
    }
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setShowTutorial(true)
      localStorage.setItem('hasSeenTutorial', 'true')
    }
  }, [])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const result = await complete(`Generate 10 questions about drones and their regulations`)
      if (result.questions && Array.isArray(result.questions)) {
        console.log('Preguntas recibidas:', result.questions)
        setQuestions(result.questions)
        setPreviousQuestions(prevQuestions => {
          const updatedQuestions = [...prevQuestions, ...result.questions]
          localStorage.setItem('previousQuestions', JSON.stringify(updatedQuestions))
          return updatedQuestions
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error("Error al cargar las preguntas. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = useCallback((index: number) => {
    if (questions[currentQuestionNumber] && !answered) {
      setAnswered(true)
      if (index === questions[currentQuestionNumber].correctAnswer) {
        setScore(prevScore => prevScore + 1)
        toast.success("¡Respuesta correcta!")
      } else {
        toast.error("Respuesta incorrecta.")
      }
      setTimeout(() => {
        if (currentQuestionNumber < questions.length - 1) {
          setCurrentQuestionNumber(prevNumber => prevNumber + 1)
          setAnswered(false)
        } else {
          setShowResultModal(true)
          setUserStats(prev => {
            const newStats = {
              quizzesTaken: prev.quizzesTaken + 1,
              averageScore: Math.round(((prev.averageScore * prev.quizzesTaken) + (score / questions.length * 100)) / (prev.quizzesTaken + 1))
            }
            localStorage.setItem('userStats', JSON.stringify(newStats))
            return newStats
          })
        }
      }, 2000)
    }
  }, [questions, currentQuestionNumber, answered, score])

  const startNewQuiz = () => {
    setCurrentQuestionNumber(0)
    setScore(0)
    setAnswered(false)
    setQuestions([])
    setShowResultModal(false)
    loadQuestions()
  }

  const retryQuiz = () => {
    setCurrentQuestionNumber(0)
    setScore(0)
    setAnswered(false)
    setShowResultModal(false)
  }

  const handleSelectModule = (module: string) => {
    if (module === 'módulos') {
      setShowModules(true)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Aquí se implementaría la lógica para cambiar el tema
  }

  const sendFeedback = () => {
    toast.success("Gracias por tu retroalimentación. La revisaremos pronto.")
  }

  return (
    <div className={`flex min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      <aside className={`w-64 bg-background shadow-lg overflow-y-auto fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out transform lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          userStats={userStats} 
          currentQuiz={{ totalQuestions: questions.length, currentQuestion: currentQuestionNumber + 1 }}
          onSelectModule={handleSelectModule}
          onQuickStart={startNewQuiz}
        />
      </aside>
      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="flex justify-between items-center p-4 border-b shadow-sm bg-background/60 backdrop-blur-sm sticky top-0 z-20">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowSidebar(!showSidebar)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-medium">Cuestionario de Maestría en Drones</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast.info("Aquí encontrarás ayuda y FAQs")}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar del usuario" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 max-w-3xl mx-auto w-full">
          {showModules ? (
            <ModuleView onClose={() => setShowModules(false)} />
          ) : questions.length > 0 ? (
            <>
              <div className="mb-8 text-sm font-medium text-muted-foreground self-start w-full flex justify-between items-center">
                <span>Pregunta {currentQuestionNumber + 1} de {questions.length}</span>
                <span>Puntuación: {score}</span>
              </div>
              <AnimatePresence mode="wait">
                <QuestionView
                  key={currentQuestionNumber}
                  question={questions[currentQuestionNumber]}
                  onAnswer={handleAnswer}
                  answered={answered}
                />
              </AnimatePresence>
            </>
          ) : isLoading ? (
            <div className="text-lg text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Cargando cuestionario...
            </div>
          ) : (
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">¿Listo para poner a prueba tus conocimientos sobre drones?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Desafíate con nuestro cuestionario completo sobre drones y compara tus resultados con otros entusiastas.</p>
              <div className="flex items-center justify-center space-x-4">
                <Button onClick={startNewQuiz} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Comenzar Cuestionario <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Dificultad: Intermedia</span>
              </div>
            </motion.div>
          )}
        </main>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg"
          onClick={sendFeedback}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
      <AnimatePresence>
        {showResultModal && (
          <ResultModal
            isOpen={showResultModal}
            onClose={() => setShowResultModal(false)}
            score={score}
            totalQuestions={questions.length}
            onRetry={retryQuiz}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
            >
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Bienvenido a tu Maestría en Drones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Este es un breve tutorial para ayudarte a comenzar:</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Usa el menú lateral para navegar entre secciones</li>
                    <li>Completa cuestionarios para mejorar tu puntuación</li>
                    <li>Revisa tu progreso en el panel superior</li>
                    <li>¡No dudes en enviarnos tu retroalimentación!</li>
                  </ul>
                </CardContent>
                <CardContent className="flex justify-end">
                  <Button onClick={() => setShowTutorial(false)}>Entendido</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}