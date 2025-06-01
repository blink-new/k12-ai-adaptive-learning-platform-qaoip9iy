import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, BookOpen, Brain } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
  subject: string
  difficulty: number
}

interface InitialAssessmentProps {
  onComplete: () => void
}

export default function InitialAssessment({ onComplete }: InitialAssessmentProps) {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedIndex: number; correct: boolean }>>([])
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState<'intro' | 'questions' | 'complete'>('intro')

  useEffect(() => {
    if (!user?.grade) return
    
    // Generate grade-appropriate questions
    const generateQuestions = (): Question[] => {
      const gradeNum = user.grade === 'K' ? 0 : parseInt(user.grade)
      
      if (gradeNum <= 2) {
        return [
          {
            id: '1',
            text: 'What is 2 + 3?',
            options: ['4', '5', '6'],
            correctIndex: 1,
            subject: 'Math',
            difficulty: 1
          },
          {
            id: '2',
            text: 'Which letter comes after "B"?',
            options: ['A', 'C', 'D'],
            correctIndex: 1,
            subject: 'Reading',
            difficulty: 1
          },
          {
            id: '3',
            text: 'How many sides does a triangle have?',
            options: ['2', '3', '4'],
            correctIndex: 1,
            subject: 'Math',
            difficulty: 1
          }
        ]
      } else if (gradeNum <= 5) {
        return [
          {
            id: '1',
            text: 'What is 7 × 8?',
            options: ['54', '56', '58'],
            correctIndex: 1,
            subject: 'Math',
            difficulty: 2
          },
          {
            id: '2',
            text: 'What is the past tense of "run"?',
            options: ['runned', 'ran', 'running'],
            correctIndex: 1,
            subject: 'Reading',
            difficulty: 2
          },
          {
            id: '3',
            text: 'Which planet is closest to the Sun?',
            options: ['Venus', 'Mercury', 'Earth'],
            correctIndex: 1,
            subject: 'Science',
            difficulty: 2
          }
        ]
      } else {
        return [
          {
            id: '1',
            text: 'Solve for x: 2x + 5 = 13',
            options: ['3', '4', '5'],
            correctIndex: 1,
            subject: 'Math',
            difficulty: 3
          },
          {
            id: '2',
            text: 'What is a synonym for "enormous"?',
            options: ['tiny', 'huge', 'average'],
            correctIndex: 1,
            subject: 'Reading',
            difficulty: 3
          },
          {
            id: '3',
            text: 'What gas do plants absorb from the atmosphere during photosynthesis?',
            options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen'],
            correctIndex: 1,
            subject: 'Science',
            difficulty: 3
          }
        ]
      }
    }

    setQuestions(generateQuestions())
    setLoading(false)
  }, [user])

  const handleSubmit = () => {
    if (selectedOption === null || !questions[currentIndex]) return
    
    const currentQuestion = questions[currentIndex]
    const isCorrect = selectedOption === currentQuestion.correctIndex
    
    setFeedback(isCorrect ? 'Correct! Great job!' : `Incorrect. The correct answer is "${currentQuestion.options[currentQuestion.correctIndex]}".`)
    
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      correct: isCorrect
    }])
  }

  const handleNext = () => {
    setFeedback(null)
    setSelectedOption(null)
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      completeAssessment()
    }
  }

  const completeAssessment = async () => {
    try {
      const score = answers.filter(a => a.correct).length
      const totalQuestions = questions.length
      const percentageScore = Math.round((score / totalQuestions) * 100)
      
      // Save assessment to database
      await supabase
        .from('assessments')
        .insert({
          student_id: user!.id,
          assessment_type: 'initial',
          score: percentageScore,
          total_questions: totalQuestions,
          correct_answers: score,
          completed: true,
          assessment_data: {
            answers,
            grade: user!.grade,
            subjects_tested: [...new Set(questions.map(q => q.subject))]
          }
        })

      setStage('complete')
      
      // Auto-proceed to dashboard after a moment
      setTimeout(() => {
        onComplete()
      }, 3000)
    } catch (error) {
      console.error('Failed to save assessment:', error)
      onComplete() // Proceed anyway
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Welcome to Your Learning Journey!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Hi {user?.first_name}! We're excited to get to know you better.
            </p>
            <p className="text-gray-600">
              This quick assessment will help us understand your current skills in Grade {user?.grade} topics so we can create the perfect learning path just for you.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 my-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <BookOpen className="h-5 w-5" />
                <span className="font-semibold">What to expect:</span>
              </div>
              <ul className="mt-2 text-sm text-blue-600 space-y-1">
                <li>• Just {questions.length} quick questions</li>
                <li>• Grade {user?.grade} level topics</li>
                <li>• No pressure - this helps us help you!</li>
              </ul>
            </div>
            <Button 
              onClick={() => setStage('questions')} 
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              Let's Start!
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (stage === 'complete') {
    const score = answers.filter(a => a.correct).length
    const totalQuestions = questions.length
    const percentageScore = Math.round((score / totalQuestions) * 100)
    
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Great job, {user?.first_name}! You scored {score} out of {totalQuestions} ({percentageScore}%).
            </p>
            <p className="text-gray-600">
              We're now creating your personalized learning path based on your results. Get ready for an amazing learning adventure!
            </p>
            <div className="animate-pulse text-blue-600 font-semibold">
              Taking you to your dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Questions stage
  if (questions.length === 0) {
    return <div className="p-6 text-center">No questions available for your grade level.</div>
  }

  const currentQuestion = questions[currentIndex]
  const progressPercent = ((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <Progress value={progressPercent} className="mb-4" />
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="font-semibold text-blue-600">{currentQuestion.subject}</span>
          </div>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={selectedOption?.toString() || ''} 
            onValueChange={(val) => setSelectedOption(Number(val))}
            disabled={feedback !== null}
          >
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1 p-2 rounded hover:bg-gray-50">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {feedback && (
            <div className={`p-3 rounded-lg ${feedback.startsWith('Correct') ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
              {feedback}
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={selectedOption === null || feedback !== null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={feedback === null}
              variant={currentIndex + 1 === questions.length ? 'default' : 'outline'}
              className={currentIndex + 1 === questions.length ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {currentIndex + 1 === questions.length ? 'Finish Assessment' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}