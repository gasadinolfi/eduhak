'use client'

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Question } from "@/lib/schema"
import { Menu, BookOpen, BarChart, User, Settings, Trophy, ArrowRight, X, FileText, Bell, HelpCircle, MessageSquare, Play, Sun, Moon, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { experimental_useObject as useObject } from 'ai/react'
import { z } from 'zod'
import { quizQuestionsSchema } from '@/lib/schema'

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

const Sidebar = ({ userStats, currentQuiz, onSelectModule, onQuickStart }: { 
  userStats: { quizzesTaken: number, averageScore: number }, 
  currentQuiz: { totalQuestions: number, currentQuestion: number },
  onSelectModule: (module: string) => void,
  onQuickStart: () => void
}) => {
  return (
    <div className="w-full h-full bg-background flex flex-col shadow-lg overflow-y-auto">
      <div className="flex flex-col items-start p-6 space-y-4 bg-gradient-to-b from-primary/10 to-background">
        <Avatar className="w-12 h-12 ring-2 ring-primary ring-offset-2 ring-offset-background">
          <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Avatar del usuario" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">Nombre de Usuario</h2>
          <p className="text-sm text-muted-foreground">usuario@ejemplo.com</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="mx-4 mb-4 flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors"
        onClick={onQuickStart}
      >
        <Play className="w-4 h-4 mr-2" />
        Inicio Rápido
      </Button>
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {[
            { icon: BookOpen, label: 'Cursos' },
            { icon: BarChart, label: 'Progreso' },
            { icon: User, label: 'Perfil' },
            { icon: Settings, label: 'Ajustes' },
            { icon: FileText, label: 'Módulos' },
            { icon: Bell, label: 'Notificaciones' },
          ].map(({ icon: Icon, label }) => (
            <li key={label}>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-secondary transition-colors"
                onClick={() => label === 'Módulos' && onSelectModule('módulos')}
              >
                <Icon className="w-4 h-4 mr-3" />
                {label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 space-y-4 bg-secondary/50 backdrop-blur-sm">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Cuestionarios realizados:</div>
          <div>{userStats.quizzesTaken}</div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Puntuación promedio:</div>
          <div>{userStats.averageScore}%</div>
        </div>
        {currentQuiz.totalQuestions > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="text-sm font-medium mb-2">Progreso del cuestionario actual</div>
            <div className="text-xs text-muted-foreground mt-2">
              Pregunta {currentQuiz.currentQuestion} de {currentQuiz.totalQuestions}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ResultModal = ({ isOpen, onClose, score, totalQuestions, onRetry }: { isOpen: boolean, onClose: () => void, score: number, totalQuestions: number, onRetry: () => void }) => {
  if (!isOpen) return null;

  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <motion.div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-background rounded-lg p-8 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">¡Cuestionario Completado!</h2>
          <p className="text-muted-foreground mb-6">¡Buen trabajo! Aquí están tus resultados:</p>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg">Puntuación:</span>
            <span className="text-2xl font-bold">{score} / {totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg">Porcentaje:</span>
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continuar Aprendiendo
          </Button>
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full"
          >
            Intentar de Nuevo
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ModuleView = ({ onClose }: { onClose: () => void }) => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Módulos de Aprendizaje</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {['Introducción a los Drones', 'Legislación y Regulaciones', 'Pilotaje Básico'].map((module, index) => (
            <motion.li 
              key={module}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-lg font-medium">Módulo {index + 1}: {module}</h3>
              <p className="text-sm text-muted-foreground">Descripción breve del módulo.</p>
              <Button variant="link" className="p-0 h-auto">Ver PDF</Button>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
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

  const { object: questionsData, submit: loadQuestions, isLoading, error } = useObject({
    api: '/api/chat',
    schema: quizQuestionsSchema
  })

  const handleAnswer = useCallback((index: number) => {
    if (questionsData?.questions[currentQuestionNumber] && !answered) {
      setAnswered(true)
      if (index === questionsData.questions[currentQuestionNumber].correctAnswer) {
        setScore(prevScore => prevScore + 1)
        toast.success("¡Respuesta correcta!")
      } else {
        toast.error("Respuesta incorrecta.")
      }
      setTimeout(() => {
        if (currentQuestionNumber < questionsData.questions.length - 1) {
          setCurrentQuestionNumber(prevNumber => prevNumber + 1)
          setAnswered(false)
        } else {
          setShowResultModal(true)
          setUserStats(prev => {
            const newStats = {
              quizzesTaken: prev.quizzesTaken + 1,
              averageScore: Math.round(((prev.averageScore * prev.quizzesTaken) + (score / questionsData.questions.length * 100)) / (prev.quizzesTaken + 1))
            }
            localStorage.setItem('userStats', JSON.stringify(newStats))
            return newStats
          })
        }
      }, 2000)
    }
  }, [questionsData, currentQuestionNumber, answered, score])

  const startNewQuiz = () => {
    setCurrentQuestionNumber(0)
    setScore(0)
    setAnswered(false)
    setShowResultModal(false)
    loadQuestions({ questionNumber: 10 })
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

  useEffect(() => {
    console.log('Current questions state:', questionsData);
  }, [questionsData]);

  return (
    <div className={`flex min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      <aside className={`w-64 bg-background shadow-lg overflow-y-auto fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out transform lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          userStats={userStats} 
          currentQuiz={{ totalQuestions: questionsData?.questions.length || 0, currentQuestion: currentQuestionNumber + 1 }}
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
          ) : questionsData?.questions && questionsData.questions.length > 0 ? (
            <>
              <div className="mb-8 text-sm font-medium text-muted-foreground self-start w-full flex justify-between items-center">
                <span>Pregunta {currentQuestionNumber + 1} de {questionsData.questions.length}</span>
                <span>Puntuación: {score}</span>
              </div>
              <AnimatePresence mode="wait">
                <QuestionView
                  key={currentQuestionNumber}
                  question={questionsData.questions[currentQuestionNumber]}
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
          ) : error ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-500">Error</h2>
              <p className="text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              <Button onClick={startNewQuiz} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Intentar de nuevo
              </Button>
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
            totalQuestions={questionsData?.questions.length || 0}
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

