import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Option {
  text: string
}

interface Question {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: Option[]
  correctoptionindex?: number
  correct_answer_text?: string
  explanation?: string
}

interface QuizProps {
  questions: Question[]
  onComplete: (score: number, total: number) => void
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = questions[currentIndex]

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return // prevent changing answer
    setSelectedOption(index)
    const isCorrect =
      currentQuestion.question_type === 'multiple_choice'
        ? index === currentQuestion.correctoptionindex
        : currentQuestion.question_type === 'true_false'
        ? (index === 0 && currentQuestion.correct_answer_text === 'true') || (index === 1 && currentQuestion.correct_answer_text === 'false')
        : false
    if (isCorrect) setScore(score + 1)
    setShowExplanation(true)
  }

  const handleShortAnswerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedOption !== null) return
    const formData = new FormData(e.currentTarget)
    const answer = formData.get('shortAnswer')?.toString().trim().toLowerCase() || ''
    const correct = (currentQuestion.correct_answer_text || '').toLowerCase()
    if (answer === correct) setScore(score + 1)
    setSelectedOption(0) // mark answered
    setShowExplanation(true)
  }

  const handleNext = () => {
    setSelectedOption(null)
    setShowExplanation(false)
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete(score, questions.length)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 font-semibold">
        Question {currentIndex + 1} of {questions.length}
      </div>
      <div className="mb-4 text-lg font-medium">{currentQuestion.question_text}</div>

      {currentQuestion.question_type === 'multiple_choice' && (
        <div className="space-y-2">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selectedOption === i
            const isCorrect = i === currentQuestion.correctoptionindex
            const bgColor = showExplanation
              ? isCorrect
                ? 'bg-green-200'
                : isSelected
                ? 'bg-red-200'
                : 'bg-white'
              : 'bg-white'
            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleOptionSelect(i)}
                className={`${bgColor} w-full rounded border border-gray-300 px-4 py-2 text-left hover:bg-gray-100 disabled:cursor-not-allowed`}
              >
                {opt.text}
              </button>
            )
          })}
        </div>
      )}

      {currentQuestion.question_type === 'true_false' && (
        <div className="flex space-x-4">
          {['True', 'False'].map((label, i) => {
            const isSelected = selectedOption === i
            const isCorrect =
              (i === 0 && currentQuestion.correct_answer_text === 'true') ||
              (i === 1 && currentQuestion.correct_answer_text === 'false')
            const bgColor = showExplanation
              ? isCorrect
                ? 'bg-green-200'
                : isSelected
                ? 'bg-red-200'
                : 'bg-white'
              : 'bg-white'
            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleOptionSelect(i)}
                className={`${bgColor} rounded border border-gray-300 px-6 py-2 hover:bg-gray-100 disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {currentQuestion.question_type === 'short_answer' && (
        <form onSubmit={handleShortAnswerSubmit} className="space-y-2">
          <input
            name="shortAnswer"
            type="text"
            disabled={selectedOption !== null}
            className="w-full rounded border border-gray-300 px-3 py-2"
            placeholder="Type your answer here"
            required
          />
          <Button type="submit" disabled={selectedOption !== null}>
            Submit
          </Button>
        </form>
      )}

      {showExplanation && currentQuestion.explanation && (
        <div className="mt-4 rounded border-l-4 border-blue-500 bg-blue-50 p-3 text-blue-700">
          <strong>Explanation:</strong> {currentQuestion.explanation}
        </div>
      )}

      {showExplanation && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext}>
            {currentIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </div>
      )}
    </div>
  )
}
