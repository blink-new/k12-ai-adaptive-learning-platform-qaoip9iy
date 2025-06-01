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
  topic_id: string
  title: string
  content_type: string
  content_url?: string
  content_markdown?: string
  estimated_duration_minutes?: number
  order: number
}

const CONTENT_TYPES = [
  { value: 'markdown', label: 'Text/Markdown' },
  { value: 'video', label: 'Video URL' },
  { value: 'quiz_link', label: 'Quiz Link' }
]

export default function AdminLessons() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New lesson fields
  const [newTitle, setNewTitle] = useState('')
  const [newContentType, setNewContentType] = useState('markdown')
  const [newContent, setNewContent] = useState('')
  const [newOrder, setNewOrder] = useState(0)
  const [newDuration, setNewDuration] = useState<number | ''>('')

  // Editing
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContentType, setEditContentType] = useState('markdown')
  const [editContent, setEditContent] = useState('')
  const [editOrder, setEditOrder] = useState(0)
  const [editDuration, setEditDuration] = useState<number | ''>('')

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
    if (!selectedTopicId) { setLessons([]); return }
    (async () => {
      setLoading(true)
      const { data, error } = await supabase.from('lessons').select('*').eq('topic_id', selectedTopicId).order('order')
      if (error) setError(error.message)
      else setLessons(data || [])
      setLoading(false)
    })()
  }, [selectedTopicId])

  // Add lesson
  const handleAddLesson = async () => {
    if (!selectedTopicId || !newTitle.trim()) {
      setError('Please select a topic and enter a lesson title.')
      return
    }
    setLoading(true)
    setError(null)
    const insertData: any = {
      topic_id: selectedTopicId,
      title: newTitle.trim(),
      content_type: newContentType,
      order: newOrder,
      estimated_duration_minutes: newDuration === '' ? null : Number(newDuration)
    }
    if (newContentType === 'markdown') insertData.content_markdown = newContent
    else if (newContentType === 'video' || newContentType === 'quiz_link') insertData.content_url = newContent
    const { error } = await supabase.from('lessons').insert(insertData)
    if (error) setError(error.message)
    else {
      setNewTitle(''); setNewContent(''); setNewOrder(0); setNewDuration('');
      setNewContentType('markdown')
      // Refresh lessons
      const { data } = await supabase.from('lessons').select('*').eq('topic_id', selectedTopicId).order('order')
      setLessons(data || [])
    }
    setLoading(false)
  }

  // Delete lesson
  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (error) setError(error.message)
    else setLessons(lessons.filter(l => l.id !== id))
    setLoading(false)
  }

  // Start editing
  const startEditing = (lesson: Lesson) => {
    setEditingLessonId(lesson.id)
    setEditTitle(lesson.title)
    setEditContentType(lesson.content_type)
    setEditContent(lesson.content_type === 'markdown' ? lesson.content_markdown || '' : lesson.content_url || '')
    setEditOrder(lesson.order)
    setEditDuration(lesson.estimated_duration_minutes || '')
  }
  const cancelEditing = () => {
    setEditingLessonId(null)
    setEditTitle('')
    setEditContent('')
    setEditOrder(0)
    setEditDuration('')
    setEditContentType('markdown')
  }
  // Save edit
  const saveEditing = async () => {
    if (!editingLessonId || !editTitle.trim()) {
      setError('Lesson title required.')
      return
    }
    setLoading(true)
    setError(null)
    const updateData: any = {
      title: editTitle.trim(),
      content_type: editContentType,
      order: editOrder,
      estimated_duration_minutes: editDuration === '' ? null : Number(editDuration)
    }
    if (editContentType === 'markdown') updateData.content_markdown = editContent
    else if (editContentType === 'video' || editContentType === 'quiz_link') updateData.content_url = editContent
    const { error } = await supabase.from('lessons').update(updateData).eq('id', editingLessonId)
    if (error) setError(error.message)
    else {
      cancelEditing()
      const { data } = await supabase.from('lessons').select('*').eq('topic_id', selectedTopicId).order('order')
      setLessons(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Lessons</h1>
      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 shadow-sm">{error}</div>}
      <div className="mb-8 p-6 border rounded-xl bg-white shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
          <Plus className="mr-2 h-6 w-6 text-blue-600" /> Add New Lesson
        </h2>
        <div className="mb-4">
          <Label className="font-medium text-gray-600 block mb-1">Select Subject</Label>
          <Select value={selectedSubjectId} onValueChange={v => { setSelectedSubjectId(v); setSelectedTopicId('') }}>
            <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <Label className="font-medium text-gray-600 block mb-1">Select Topic</Label>
          <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={!selectedSubjectId}>
            <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
            <SelectContent>
              {topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {selectedTopicId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label className="font-medium text-gray-600">Title</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Lesson title" className="mt-1" />
            </div>
            <div>
              <Label className="font-medium text-gray-600">Content Type</Label>
              <Select value={newContentType} onValueChange={setNewContentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="font-medium text-gray-600">Content</Label>
              {newContentType === 'markdown' ? (
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 mt-1 font-mono" placeholder="Lesson text or markdown..." />
              ) : (
                <Input value={newContent} onChange={e => setNewContent(e.target.value)} placeholder={newContentType === 'video' ? 'Video URL' : 'Quiz Link'} className="mt-1" />
              )}
            </div>
            <div>
              <Label className="font-medium text-gray-600">Order</Label>
              <Input type="number" value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label className="font-medium text-gray-600">Estimated Duration (min)</Label>
              <Input type="number" value={newDuration} onChange={e => setNewDuration(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleAddLesson} disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Add Lesson
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Lessons</h2>
        {loading && !lessons.length ? (
          <p className="text-gray-500">Loading lessons...</p>
        ) : lessons.length === 0 ? (
          <p className="text-gray-500">No lessons found for this topic. Add one above to get started!</p>
        ) : (
          <ul className="space-y-3">
            {lessons.map(lesson => (
              <li key={lesson.id} className="p-4 rounded-lg border bg-gray-50/50 hover:shadow-md transition-shadow">
                {editingLessonId === lesson.id ? (
                  <div className="space-y-3">
                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border rounded px-3 py-2 w-full" />
                    <Select value={editContentType} onValueChange={setEditContentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {editContentType === 'markdown' ? (
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 font-mono" />
                    ) : (
                      <Input value={editContent} onChange={e => setEditContent(e.target.value)} />
                    )}
                    <Input type="number" value={editOrder} onChange={e => setEditOrder(Number(e.target.value))} className="border rounded px-3 py-2 w-full" />
                    <Input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value === '' ? '' : Number(e.target.value))} className="border rounded px-3 py-2 w-full" />
                    <div className="flex space-x-2 justify-end">
                      <Button onClick={saveEditing} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
                      <Button variant="outline" onClick={cancelEditing} disabled={loading}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-800">{lesson.title} (Order: {lesson.order})</div>
                      <div className="text-sm text-gray-600 mt-1">Type: {lesson.content_type}, Duration: {lesson.estimated_duration_minutes || '-'} min</div>
                      {lesson.content_type === 'markdown' && lesson.content_markdown && <div className="text-xs text-gray-500 mt-2 line-clamp-2">Preview: {lesson.content_markdown.slice(0, 100)}...</div>}
                      {lesson.content_type === 'video' && lesson.content_url && <div className="text-xs text-blue-600 mt-2">Video: {lesson.content_url}</div>}
                      {lesson.content_type === 'quiz_link' && lesson.content_url && <div className="text-xs text-purple-600 mt-2">Quiz: {lesson.content_url}</div>}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => startEditing(lesson)} className="hover:bg-gray-100">
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteLesson(lesson.id)} className="hover:bg-red-700">
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
