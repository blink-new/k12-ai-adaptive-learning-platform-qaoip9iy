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
  subject_id: string
  name: string
  description?: string
  order: number
}

export default function AdminTopics() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicDescription, setNewTopicDescription] = useState('')
  const [newTopicOrder, setNewTopicOrder] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTopicName, setEditingTopicName] = useState('')
  const [editingTopicDescription, setEditingTopicDescription] = useState('')
  const [editingTopicOrder, setEditingTopicOrder] = useState(0)

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('name')
      if (error) {
        setError(error.message)
      } else {
        setSubjects(data || [])
        if (data && data.length > 0) {
          setSelectedSubjectId(data[0].id)
        }
      }
    } catch (err: any) {
      setError('Failed to fetch subjects: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async (subjectId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('topics').select('*').eq('subject_id', subjectId).order('order')
      if (error) {
        setError(error.message)
      } else {
        setTopics(data || [])
      }
    } catch (err: any) {
      setError('Failed to fetch topics: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubjectId) {
      fetchTopics(selectedSubjectId)
    } else {
      setTopics([])
    }
  }, [selectedSubjectId])

  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !selectedSubjectId) {
      setError('Topic name and subject are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('topics').insert({
        subject_id: selectedSubjectId,
        name: newTopicName.trim(),
        description: newTopicDescription.trim(),
        order: newTopicOrder
      })
      if (error) {
        setError(error.message)
      } else {
        setNewTopicName('')
        setNewTopicDescription('')
        setNewTopicOrder(0)
        fetchTopics(selectedSubjectId)
      }
    } catch (err: any) {
      setError('Failed to add topic: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('topics').delete().eq('id', id)
      if (error) {
        setError(error.message)
      } else {
        if (selectedSubjectId) fetchTopics(selectedSubjectId)
      }
    } catch (err: any) {
      setError('Failed to delete topic: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (topic: Topic) => {
    setEditingTopicId(topic.id)
    setEditingTopicName(topic.name)
    setEditingTopicDescription(topic.description || '')
    setEditingTopicOrder(topic.order)
  }

  const cancelEditing = () => {
    setEditingTopicId(null)
    setEditingTopicName('')
    setEditingTopicDescription('')
    setEditingTopicOrder(0)
  }

  const saveEditing = async () => {
    if (!editingTopicName.trim() || !editingTopicId) {
      setError('Topic name is required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('topics').update({
        name: editingTopicName.trim(),
        description: editingTopicDescription.trim(),
        order: editingTopicOrder
      }).eq('id', editingTopicId)
      if (error) {
        setError(error.message)
      } else {
        cancelEditing()
        if (selectedSubjectId) fetchTopics(selectedSubjectId)
      }
    } catch (err: any) {
      setError('Failed to update topic: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Topics</h1>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 shadow-sm">{error}</div>}

      <div className="mb-8 p-6 border rounded-xl bg-white shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
          <Plus className="mr-2 h-6 w-6 text-blue-600" /> Add New Topic
        </h2>

        <div className="mb-4">
          <Label htmlFor="subjectSelect" className="font-medium text-gray-600">Select Subject</Label>
          <Select value={selectedSubjectId || ''} onValueChange={setSelectedSubjectId} id="subjectSelect">
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <Label htmlFor="newTopicName" className="font-medium text-gray-600">Name</Label>
            <Input
              id="newTopicName"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name"
              required
              className="mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="newTopicDescription" className="font-medium text-gray-600">Description</Label>
            <Input
              id="newTopicDescription"
              value={newTopicDescription}
              onChange={(e) => setNewTopicDescription(e.target.value)}
              placeholder="Optional description"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="newTopicOrder" className="font-medium text-gray-600">Order</Label>
            <Input
              id="newTopicOrder"
              type="number"
              value={newTopicOrder}
              onChange={(e) => setNewTopicOrder(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        <Button onClick={handleAddTopic} disabled={loading} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? 'Adding...' : 'Add Topic'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Existing Topics</h2>
        {loading && !topics.length ? (
          <p className="text-gray-500">Loading topics...</p>
        ) : topics.length === 0 ? (
          <p className="text-gray-500">No topics found for this subject. Add one above to get started!</p>
        ) : (
          <ul className="space-y-3">
            {topics.map((topic) => (
              <li key={topic.id} className="p-4 rounded-lg border bg-gray-50/50 hover:shadow-md transition-shadow">
                {editingTopicId === topic.id ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={editingTopicName}
                      onChange={(e) => setEditingTopicName(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <Input
                      type="text"
                      value={editingTopicDescription}
                      onChange={(e) => setEditingTopicDescription(e.target.value)}
                      placeholder="Optional description"
                      className="border rounded px-3 py-2 w-full"
                    />
                    <Input
                      type="number"
                      value={editingTopicOrder}
                      onChange={(e) => setEditingTopicOrder(Number(e.target.value))}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="flex space-x-2 justify-end">
                      <Button onClick={saveEditing} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        Save
                      </Button>
                      <Button variant="outline" onClick={cancelEditing} disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-800">{topic.name}</div>
                      {topic.description && <div className="text-sm text-gray-600 mt-1">{topic.description}</div>}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => startEditing(topic)} className="hover:bg-gray-100">
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTopic(topic.id)} className="hover:bg-red-700">
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