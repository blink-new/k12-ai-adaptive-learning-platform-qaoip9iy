import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'

interface AssessmentSubmissionProps {
  questionId: string
  questionText: string
  onSubmitted: () => void
}

export default function AssessmentSubmission({ questionId, questionText, onSubmitted }: AssessmentSubmissionProps) {
  const { user } = useAuth()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!answer.trim() || !user) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://ftnfjpyasooqbzhkblpo.functions.supabase.co/save-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          question_id: questionId,
          score: null, // score will be computed by AI asynchronously or later
          feedback: null, // feedback will be computed by AI asynchronously or later
          current_topic: '', // placeholder, update as needed
          progress: {}, // placeholder, update as needed
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit answer')
      } else {
        onSubmitted()
        setAnswer('')
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl p-4 bg-white rounded shadow space-y-4">
      <h3 className="text-lg font-semibold">{questionText}</h3>
      <Textarea
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        disabled={loading}
        className="resize-none"
      />
      {error && <p className="text-red-600">{error}</p>}
      <Button onClick={handleSubmit} disabled={loading || !answer.trim()}>
        {loading ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </div>
  )
}