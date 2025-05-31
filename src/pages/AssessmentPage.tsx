import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Question {
  id: string
  text: string
  options: string[]
  correctOptionIndex: number
  difficulty: number
}

export default function AssessmentPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!user) return

    // Load questions based on user grade
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('grade', user.grade)
          .order('difficulty', { ascending: true })

        if (error) {
          console.error('Error loading questions:', error)
          return
        }

        setQuestions(data || [])
      } catch (error) {
        console.error('Error loading questions:', error)
      }
    }

    loadQuestions()
  }, [user])

  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (index: number) => {
    setSelectedOptionIndex(index)
  }

  const handleNext = async () => {
    if (selectedOptionIndex === null || !user) return

    if (selectedOptionIndex === currentQuestion.correctOptionIndex) {
      setScore(score + 1)
    }

    // Adaptive difficulty logic (simplified)
    // If correct, next question difficulty increases, else decreases
    // For demo, just move to next question

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOptionIndex(null)
    } else {
      setCompleted(true)
      // Save assessment result to Supabase
      await supabase.from('assessments').insert({
        student_id: user.id,
        subject: 'General Knowledge',
        score,
        difficulty_level: questions.reduce((acc, q) => acc + q.difficulty, 0) / questions.length,
        questions_answered: questions.length,
        time_spent: 0
      })
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Assessment Complete!</h1>
        <p className="text-xl">Your score: {score} / {questions.length}</p>
        <Button className="mt-6" onClick={() => {
          setCurrentQuestionIndex(0)
          setSelectedOptionIndex(null)
          setScore(0)
          setCompleted(false)
        }}>
          Retake Assessment
        </Button>
      </div>
    )
  }

  if (!questions.length) {
    return <p className="p-4">Loading questions...</p>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg font-semibold">{currentQuestion.text}</p>
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOptionIndex === index ? 'default' : 'outline'}
                onClick={() => handleOptionSelect(index)}
              >
                {option}
              </Button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={handleNext} disabled={selectedOptionIndex === null}>
            {currentQuestionIndex + 1 === questions.length ? 'Finish' : 'Next'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}