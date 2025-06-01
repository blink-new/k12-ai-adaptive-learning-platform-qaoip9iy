import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function AddFirstChild() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!form.firstName || !form.lastName || !form.grade || !form.username || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    // Check username uniqueness
    const { data: existing, error: usernameError } = await supabase
      .from('students')
      .select('id')
      .eq('username', form.username)
      .single()
    if (existing) {
      setError('Username already taken. Please choose another.')
      setLoading(false)
      return
    }
    if (usernameError && usernameError.code !== 'PGRST116') {
      setError('Error checking username.')
      setLoading(false)
      return
    }
    try {
      // Create child record
      const { data: child, error: childError } = await supabase
        .from('students')
        .insert({
          parent_id: user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          grade: form.grade,
          username: form.username,
          password: form.password // In production, hash this or use secure auth
        })
        .select()
        .single()
      if (childError) throw childError
      // Update parent's children array
      const { data: parentData } = await supabase
        .from('parents')
        .select('children')
        .eq('user_id', user.id)
        .single()
      const currentChildren = parentData?.children || []
      const updatedChildren = [...currentChildren, child.id]
      await supabase
        .from('parents')
        .update({ children: updatedChildren })
        .eq('user_id', user.id)
      navigate('/parent', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Failed to add child.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Add Your First Child</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <select
                id="grade"
                value={form.grade}
                onChange={e => handleChange('grade', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-lg"
                required
              >
                <option value="">Select grade</option>
                <option value="K">Kindergarten</option>
                <option value="1">1st Grade</option>
                <option value="2">2nd Grade</option>
                <option value="3">3rd Grade</option>
                <option value="4">4th Grade</option>
                <option value="5">5th Grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
              </select>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={form.username} onChange={e => handleChange('username', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} required />
            </div>
            <Button type="submit" className="w-full text-lg py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all shadow-md" disabled={loading}>
              {loading ? 'Adding...' : 'Add Child'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
