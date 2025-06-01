import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface Subject {
  id: string
  name: string
  description?: string
}

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectDescription, setNewSubjectDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [editingSubjectName, setEditingSubjectName] = useState('')
  const [editingSubjectDescription, setEditingSubjectDescription] = useState('')

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('name')
      if (error) {
        setError(error.message)
      } else {
        setSubjects(data || [])
      }
    } catch (err: any) {
      setError('Failed to fetch subjects: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      setError('Subject name is required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('subjects').insert({ name: newSubjectName.trim(), description: newSubjectDescription.trim() })
      if (error) {
        setError(error.message)
      } else {
        setNewSubjectName('')
        setNewSubjectDescription('')
        fetchSubjects()
      }
    } catch (err: any) {
      setError('Failed to add subject: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (error) {
        setError(error.message)
      } else {
        fetchSubjects()
      }
    } catch (err: any) {
      setError('Failed to delete subject: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (subject: Subject) => {
    setEditingSubjectId(subject.id)
    setEditingSubjectName(subject.name)
    setEditingSubjectDescription(subject.description || '')
  }

  const cancelEditing = () => {
    setEditingSubjectId(null)
    setEditingSubjectName('')
    setEditingSubjectDescription('')
  }

  const saveEditing = async () => {
    if (!editingSubjectName.trim()) {
      setError('Subject name is required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('subjects').update({ name: editingSubjectName.trim(), description: editingSubjectDescription.trim() }).eq('id', editingSubjectId)
      if (error) {
        setError(error.message)
      } else {
        cancelEditing()
        fetchSubjects()
      }
    } catch (err: any) {
      setError('Failed to update subject: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Subjects</h1>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 shadow-sm">{error}</div>}

      <div className="mb-8 p-6 border rounded-xl bg-white shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
          <Plus className="mr-2 h-6 w-6 text-blue-600" /> Add New Subject
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <Label htmlFor="newSubjectName" className="font-medium text-gray-600">Name</Label>
            <Input
              id="newSubjectName"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g., Mathematics"
              required
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="newSubjectDescription" className="font-medium text-gray-600">Description</Label>
            <Input
              id="newSubjectDescription"
              value={newSubjectDescription}
              onChange={(e) => setNewSubjectDescription(e.target.value)}
              placeholder="Optional: A brief overview of the subject"
              className="mt-1"
            />
          </div>
        </div>
        <Button onClick={handleAddSubject} disabled={loading} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? 'Adding...' : 'Add Subject'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Existing Subjects</h2>
        {loading && !subjects.length ? (
          <p className="text-gray-500">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="text-gray-500">No subjects found. Add one above to get started!</p>
        ) : (
          <ul className="space-y-3">
            {subjects.map((subject) => (
              <li key={subject.id} className="p-4 rounded-lg border bg-gray-50/50 hover:shadow-md transition-shadow">
                {editingSubjectId === subject.id ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={editingSubjectName}
                      onChange={(e) => setEditingSubjectName(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <Input
                      type="text"
                      value={editingSubjectDescription}
                      onChange={(e) => setEditingSubjectDescription(e.target.value)}
                      placeholder="Optional description"
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
                      <div className="font-semibold text-lg text-gray-800">{subject.name}</div>
                      {subject.description && <div className="text-sm text-gray-600 mt-1">{subject.description}</div>}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => startEditing(subject)} className="hover:bg-gray-100">
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSubject(subject.id)} className="hover:bg-red-700">
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
