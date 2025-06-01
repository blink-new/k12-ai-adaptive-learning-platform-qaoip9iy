import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface Subject {
  id: string
  name: string
}

interface Topic {
  id: string
  name: string
  subject_id: string
}

interface Lesson {
  id: string
  title: string
  topic_id: string
}

interface Option {
  text: string
  is_correct: boolean
}

interface Question {
  id: string
  subject_id?: string
  topic_id?: string
  lesson_id?: string
  question_text: string
  question_type: string
  options: Option[]
  correct_answer_text?: string
  difficulty: number
  grade_level: string
  explanation?: string
  standard_codes?: string[]
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
]

export default function AdminQuestions() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New question fields
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newQuestionType, setNewQuestionType] = useState('multiple_choice')
  const [newOptions, setNewOptions] = useState<Option[]>([{ text: '', is_correct: false }, { text: '', is_correct: false }])
  const [newCorrectAnswerText, setNewCorrectAnswerText] = useState('')
  const [newDifficulty, setNewDifficulty] = useState(1)
  const [newGradeLevel, setNewGradeLevel] = useState('')
  const [newExplanation, setNewExplanation] = useState('')
  const [newStandardCodes, setNewStandardCodes] = useState('') // comma separated

  // Editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editQuestionText, setEditQuestionText] = useState('')
  const [editQuestionType, setEditQuestionType] = useState('multiple_choice')
  const [editOptions, setEditOptions] = useState<Option[]>([{ text: '', is_correct: false }, { text: '', is_correct: false }])
  const [editCorrectAnswerText, setEditCorrectAnswerText] = useState('')
  const [editDifficulty, setEditDifficulty] = useState(1)
  const [editGradeLevel, setEditGradeLevel] = useState('')
  const [editExplanation, setEditExplanation] = useState('')
  const [editStandardCodes, setEditStandardCodes] = useState('')

  // Fetch subjects
  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data, error } = await supabase.from('subjects').select('id, name').order('name')
      if (error) setError(error.message)
      else setSubjects(data || [])
      setLoading(false)
    })()
  }, [])

  // Fetch topics when subject changes
  useEffect(() => {
    if (!selectedSubjectId) { setTopics([]); setSelectedTopicId(''); return }
    (async () => {
      setLoading(true)
      const { data, error } = await supabase.from('topics').select('id, name').eq('subject_id', selectedSubjectId).order('order')
      if (error) setError(error.message)
      else setTopics(data || [])
      setLoading(false)
    })()
  }, [selectedSubjectId])

  // Fetch lessons when topic changes
  useEffect(() => {
    if (!selectedTopicId) { setLessons([]); setSelectedLessonId(''); return }
    (async () => {
      setLoading(true)
      const { data, error } = await supabase.from('lessons').select('id, title').eq('topic_id', selectedTopicId).order('order')
      if (error) setError(error.message)
      else setLessons(data || [])
      setLoading(false)
    })()
  }, [selectedTopicId])

  // Fetch questions when lesson/topic/subject changes
  useEffect(() => {
    (async () => {
      setLoading(true)
      let query = supabase.from('questions').select('*')
      if (selectedLessonId) query = query.eq('lesson_id', selectedLessonId)
      else if (selectedTopicId) query = query.eq('topic_id', selectedTopicId)
      else if (selectedSubjectId) query = query.eq('subject_id', selectedSubjectId)
      else {
        setQuestions([])
        setLoading(false)
        return
      }
      const { data, error } = await query.order('difficulty')
      if (error) setError(error.message)
      else setQuestions(data || [])
      setLoading(false)
    })()
  }, [selectedSubjectId, selectedTopicId, selectedLessonId])

  // Handlers for new question options
  const updateNewOptionText = (index: number, text: string) => {
    const newOpts = [...newOptions]
    newOpts[index].text = text
    setNewOptions(newOpts)
  }
  const toggleNewOptionCorrect = (index: number) => {
    const newOpts = newOptions.map((opt, i) => ({ ...opt, is_correct: i === index }))
    setNewOptions(newOpts)
  }
  const addNewOption = () => {
    setNewOptions([...newOptions, { text: '', is_correct: false }])
  }
  const removeNewOption = (index: number) => {
    if (newOptions.length <= 2) return
    const newOpts = newOptions.filter((_, i) => i !== index)
    setNewOptions(newOpts)
  }

  // Handlers for edit question options
  const updateEditOptionText = (index: number, text: string) => {
    const newOpts = [...editOptions]
    newOpts[index].text = text
    setEditOptions(newOpts)
  }
  const toggleEditOptionCorrect = (index: number) => {
    const newOpts = editOptions.map((opt, i) => ({ ...opt, is_correct: i === index }))
    setEditOptions(newOpts)
  }
  const addEditOption = () => {
    setEditOptions([...editOptions, { text: '', is_correct: false }])
  }
  const removeEditOption = (index: number) => {
    if (editOptions.length <= 2) return
    const newOpts = editOptions.filter((_, i) => i !== index)
    setEditOptions(newOpts)
  }

  // Add question
  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      setError('Question text is required')
      return
    }
    if (newQuestionType === 'multiple_choice' && newOptions.some(o => !o.text.trim())) {
      setError('All options must have text')
      return
    }
    setLoading(true)
    setError(null)
    const insertData: any = {
      question_text: newQuestionText.trim(),
      question_type: newQuestionType,
      difficulty: newDifficulty,
      grade_level: newGradeLevel.trim(),
      explanation: newExplanation.trim() || null,
      standard_codes: newStandardCodes.split(',').map(s => s.trim()).filter(Boolean),
    }
    if (selectedLessonId) insertData.lesson_id = selectedLessonId
    else if (selectedTopicId) insertData.topic_id = selectedTopicId
    else if (selectedSubjectId) insertData.subject_id = selectedSubjectId

    if (newQuestionType === 'multiple_choice' || newQuestionType === 'true_false') {
      insertData.options = newOptions
      insertData.correct_answer_text = newOptions.find(o => o.is_correct)?.text || null
    } else if (newQuestionType === 'short_answer') {
      insertData.options = []
      insertData.correct_answer_text = newCorrectAnswerText.trim() || null
    }

    const { error } = await supabase.from('questions').insert(insertData)
    if (error) setError(error.message)
    else {
      setNewQuestionText('')
      setNewOptions([{ text: '', is_correct: false }, { text: '', is_correct: false }])
      setNewCorrectAnswerText('')
      setNewDifficulty(1)
      setNewGradeLevel('')
      setNewExplanation('')
      setNewStandardCodes('')
      // Refresh questions
      let query = supabase.from('questions').select('*')
      if (selectedLessonId) query = query.eq('lesson_id', selectedLessonId)
      else if (selectedTopicId) query = query.eq('topic_id', selectedTopicId)
      else if (selectedSubjectId) query = query.eq('subject_id', selectedSubjectId)
      const { data } = await query.order('difficulty')
      setQuestions(data || [])
    }
    setLoading(false)
  }

  // Delete question
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Delete this question?')) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) setError(error.message)
    else setQuestions(questions.filter(q => q.id !== id))
    setLoading(false)
  }

  // Start editing
  const startEditing = (question: Question) => {
    setEditingQuestionId(question.id)
    setEditQuestionText(question.question_text)
    setEditQuestionType(question.question_type)
    setEditOptions(question.options.length > 0 ? question.options : [{ text: '', is_correct: false }, { text: '', is_correct: false }])
    setEditCorrectAnswerText(question.correct_answer_text || '')
    setEditDifficulty(question.difficulty)
    setEditGradeLevel(question.grade_level)
    setEditExplanation(question.explanation || '')
    setEditStandardCodes((question.standard_codes || []).join(', '))
  }
  const cancelEditing = () => {
    setEditingQuestionId(null)
    setEditQuestionText('')
    setEditOptions([{ text: '', is_correct: false }, { text: '', is_correct: false }])
    setEditCorrectAnswerText('')
    setEditDifficulty(1)
    setEditGradeLevel('')
    setEditExplanation('')
    setEditStandardCodes('')
    setEditQuestionType('multiple_choice')
  }

  // Save edit
  const saveEditing = async () => {
    if (!editingQuestionId || !editQuestionText.trim()) {
      setError('Question text is required')
      return
    }
    if (editQuestionType === 'multiple_choice' && editOptions.some(o => !o.text.trim())) {
      setError('All options must have text')
      return
    }
    setLoading(true)
    setError(null)
    const updateData: any = {
      question_text: editQuestionText.trim(),
      question_type: editQuestionType,
      difficulty: editDifficulty,
      grade_level: editGradeLevel.trim(),
      explanation: editExplanation.trim() || null,
      standard_codes: editStandardCodes.split(',').map(s => s.trim()).filter(Boolean),
    }
    if (editQuestionType === 'multiple_choice' || editQuestionType === 'true_false') {
      updateData.options = editOptions
      updateData.correct_answer_text = editOptions.find(o => o.is_correct)?.text || null
    } else if (editQuestionType === 'short_answer') {
      updateData.options = []
      updateData.correct_answer_text = editCorrectAnswerText.trim() || null
    }
    const { error } = await supabase.from('questions').update(updateData).eq('id', editingQuestionId)
    if (error) setError(error.message)
    else {
      cancelEditing()
      let query = supabase.from('questions').select('*')
      if (selectedLessonId) query = query.eq('lesson_id', selectedLessonId)
      else if (selectedTopicId) query = query.eq('topic_id', selectedTopicId)
      else if (selectedSubjectId) query = query.eq('subject_id', selectedSubjectId)
      const { data } = await query.order('difficulty')
      setQuestions(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Questions</h1>
      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 shadow-sm">{error}</div>}

      <div className="mb-8 p-6 border rounded-xl bg-white shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
          <Plus className="mr-2 h-6 w-6 text-blue-600" /> Add New Question
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="font-medium text-gray-600 block mb-1">Subject</Label>
            <Select value={selectedSubjectId} onValueChange={v => { setSelectedSubjectId(v); setSelectedTopicId(''); setSelectedLessonId('') }}>
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-medium text-gray-600 block mb-1">Topic</Label>
            <Select value={selectedTopicId} onValueChange={v => { setSelectedTopicId(v); setSelectedLessonId('') }} disabled={!selectedSubjectId}>
              <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
              <SelectContent>
                {topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-medium text-gray-600 block mb-1">Lesson</Label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={!selectedTopicId}>
              <SelectTrigger><SelectValue placeholder="Select a lesson" /></SelectTrigger>
              <SelectContent>
                {lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label className="font-medium text-gray-600 block mb-1">Question Text</Label>
          <Input value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} placeholder="Enter question text" />
        </div>

        <div className="mt-4">
          <Label className="font-medium text-gray-600 block mb-1">Question Type</Label>
          <Select value={newQuestionType} onValueChange={setNewQuestionType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map(qt => <SelectItem key={qt.value} value={qt.value}>{qt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {(newQuestionType === 'multiple_choice' || newQuestionType === 'true_false') && (
          <div className="mt-4">
            <Label className="font-medium text-gray-600 block mb-1">Options</Label>
            {newOptions.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2 mb-2">
                <Input
                  value={opt.text}
                  onChange={e => updateNewOptionText(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-grow"
                />
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="newCorrectOption"
                    checked={opt.is_correct}
                    onChange={() => toggleNewOptionCorrect(i)}
                  />
                  <span>Correct</span>
                </label>
                {newOptions.length > 2 && (
                  <Button variant="destructive" size="sm" onClick={() => removeNewOption(i)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button size="sm" onClick={addNewOption} className="mt-2">
              Add Option
            </Button>
          </div>
        )}

        {newQuestionType === 'short_answer' && (
          <div className="mt-4">
            <Label className="font-medium text-gray-600 block mb-1">Correct Answer Text</Label>
            <Input value={newCorrectAnswerText} onChange={e => setNewCorrectAnswerText(e.target.value)} placeholder="Enter correct answer text" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label className="font-medium text-gray-600 block mb-1">Difficulty (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={newDifficulty}
              onChange={e => setNewDifficulty(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="font-medium text-gray-600 block mb-1">Grade Level</Label>
            <Input value={newGradeLevel} onChange={e => setNewGradeLevel(e.target.value)} placeholder="e.g., 3rd Grade" />
          </div>
        </div>

        <div className="mt-4">
          <Label className="font-medium text-gray-600 block mb-1">Explanation</Label>
          <Input value={newExplanation} onChange={e => setNewExplanation(e.target.value)} placeholder="Optional explanation for the correct answer" />
        </div>

        <div className="mt-4">
          <Label className="font-medium text-gray-600 block mb-1">Standard Codes (comma separated)</Label>
          <Input value={newStandardCodes} onChange={e => setNewStandardCodes(e.target.value)} placeholder="e.g., CCSS.Math.Content.HSG.SRT.A.1" />
        </div>

        <Button onClick={handleAddQuestion} disabled={loading} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
          Add Question
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Existing Questions</h2>
        {loading && !questions.length ? (
          <p className="text-gray-500">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-gray-500">No questions found for the selected scope.</p>
        ) : (
          <ul className="space-y-3">
            {questions.map(q => (
              <li key={q.id} className="p-4 rounded-lg border bg-gray-50/50 hover:shadow-md transition-shadow">
                {editingQuestionId === q.id ? (
                  <div className="space-y-3">
                    <Input value={editQuestionText} onChange={e => setEditQuestionText(e.target.value)} className="border rounded px-3 py-2 w-full" />
                    <Select value={editQuestionType} onValueChange={setEditQuestionType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(qt => <SelectItem key={qt.value} value={qt.value}>{qt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {(editQuestionType === 'multiple_choice' || editQuestionType === 'true_false') && (
                      <div>
                        <Label className="font-medium text-gray-600 block mb-1">Options</Label>
                        {editOptions.map((opt, i) => (
                          <div key={i} className="flex items-center space-x-2 mb-2">
                            <Input
                              value={opt.text}
                              onChange={e => updateEditOptionText(i, e.target.value)}
                              placeholder={`Option ${i + 1}`}
                              className="flex-grow"
                            />
                            <label className="flex items-center space-x-1">
                              <input
                                type="radio"
                                name={`editCorrectOption-${q.id}`}
                                checked={opt.is_correct}
                                onChange={() => toggleEditOptionCorrect(i)}
                              />
                              <span>Correct</span>
                            </label>
                            {editOptions.length > 2 && (
                              <Button variant="destructive" size="sm" onClick={() => removeEditOption(i)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button size="sm" onClick={addEditOption} className="mt-2">
                          Add Option
                        </Button>
                      </div>
                    )}
                    {editQuestionType === 'short_answer' && (
                      <div>
                        <Label className="font-medium text-gray-600 block mb-1">Correct Answer Text</Label>
                        <Input value={editCorrectAnswerText} onChange={e => setEditCorrectAnswerText(e.target.value)} placeholder="Enter correct answer text" />
                      </div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium text-gray-600 block mb-1">Difficulty (1-5)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={editDifficulty}
                          onChange={e => setEditDifficulty(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600 block mb-1">Grade Level</Label>
                        <Input value={editGradeLevel} onChange={e => setEditGradeLevel(e.target.value)} placeholder="e.g., 3rd Grade" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="font-medium text-gray-600 block mb-1">Explanation</Label>
                      <Input value={editExplanation} onChange={e => setEditExplanation(e.target.value)} placeholder="Optional explanation for the correct answer" />
                    </div>
                    <div className="mt-4">
                      <Label className="font-medium text-gray-600 block mb-1">Standard Codes (comma separated)</Label>
                      <Input value={editStandardCodes} onChange={e => setEditStandardCodes(e.target.value)} placeholder="e.g., CCSS.Math.Content.HSG.SRT.A.1" />
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <Button onClick={saveEditing} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
                      <Button variant="outline" onClick={cancelEditing} disabled={loading}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-800">{q.question_text}</div>
                      <div className="text-sm text-gray-600 mt-1">Type: {q.question_type}, Difficulty: {q.difficulty}, Grade: {q.grade_level}</div>
                      {q.explanation && <div className="text-xs text-gray-500 mt-1">Explanation: {q.explanation}</div>}
                      {q.standard_codes && q.standard_codes.length > 0 && <div className="text-xs text-gray-500 mt-1">Standards: {q.standard_codes.join(', ')}</div>}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => startEditing(q)} className="hover:bg-gray-100">
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(q.id)} className="hover:bg-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
