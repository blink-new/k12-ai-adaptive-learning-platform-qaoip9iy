import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

interface Question {
  id: string
  text: string
  options: string[]
  correctOptionIndex: number
  difficulty: number
  grade: string
}

export default function AdminContentManagement() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newOptions, setNewOptions] = useState(['', '', '', ''])
  const [newCorrectIndex, setNewCorrectIndex] = useState(0)
  const [newDifficulty, setNewDifficulty] = useState(1)
  const [newGrade, setNewGrade] = useState('k')

  useEffect(() => {
    if (!user) return

    const fetchQuestions = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('questions').select('*')
      if (error) {
        console.error('Error fetching questions:', error)
      } else {
        setQuestions(data || [])
      }
      setLoading(false)
    }

    fetchQuestions()
  }, [user])

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim() || newOptions.some(opt => !opt.trim())) return

    const { data, error } = await supabase.from('questions').insert([{ 
      text: newQuestionText,
      options: newOptions,
      correctOptionIndex: newCorrectIndex,
      difficulty: newDifficulty,
      grade: newGrade
    }])

    if (error) {
      console.error('Error adding question:', error)
      return
    }

    setQuestions(prev => [...prev, ...data])
    setNewQuestionText('')
    setNewOptions(['', '', '', ''])
    setNewCorrectIndex(0)
    setNewDifficulty(1)
    setNewGrade('k')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Content Management</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
        <div className="space-y-4 max-w-xl">
          <Input
            placeholder="Question text"
            value={newQuestionText}
            onChange={e => setNewQuestionText(e.target.value)}
          />
          {newOptions.map((opt, idx) => (
            <Input
              key={idx}
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={e => {
                const newOpts = [...newOptions]
                newOpts[idx] = e.target.value
                setNewOptions(newOpts)
              }}
            />
          ))}
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <span>Correct Option:</span>
              <select
                value={newCorrectIndex}
                onChange={e => setNewCorrectIndex(Number(e.target.value))}
                className="border rounded p-1"
              >
                {newOptions.map((_, idx) => (
                  <option key={idx} value={idx}>{idx + 1}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center space-x-2">
              <span>Difficulty:</span>
              <select
                value={newDifficulty}
                onChange={e => setNewDifficulty(Number(e.target.value))}
                className="border rounded p-1"
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center space-x-2">
              <span>Grade:</span>
              <select
                value={newGrade}
                onChange={e => setNewGrade(e.target.value)}
                className="border rounded p-1"
              >
                {['k', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                  <option key={g} value={g}>{g.toUpperCase()}</option>
                ))}
              </select>
            </label>
          </div>
          <Button onClick={handleAddQuestion} className="mt-4">Add Question</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Existing Questions</h2>
        {loading ? (
          <p>Loading questions...</p>
        ) : (
          <ul className="space-y-4 max-w-xl">
            {questions.map(q => (
              <li key={q.id} className="bg-white p-4 rounded shadow">
                <p className="font-semibold">{q.text}</p>
                <ul className="list-disc list-inside">
                  {q.options.map((opt, idx) => (
                    <li key={idx} className={idx === q.correctOptionIndex ? 'font-bold text-green-600' : ''}>
                      {opt}
                    </li>
                  ))}
                </ul>
                <p>Difficulty: {q.difficulty}</p>
                <p>Grade: {q.grade.toUpperCase()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}