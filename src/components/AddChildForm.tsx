import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { Plus, UserPlus } from 'lucide-react'

interface AddChildFormProps {
  parentId: string
  onChildAdded: () => void
  onCancel?: () => void
}

export default function AddChildForm({ parentId, onChildAdded, onCancel }: AddChildFormProps) {
  const [childData, setChildData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    dateOfBirth: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setChildData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create a student record for the child
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          parent_id: parentId,
          first_name: childData.firstName,
          last_name: childData.lastName,
          grade: childData.grade,
          date_of_birth: childData.dateOfBirth,
          points: 0,
          streak_days: 0,
          weekly_goal: 20
        })
        .select()
        .single()

      if (studentError) {
        throw studentError
      }

      // Update parent's children array
      const { data: parentData } = await supabase
        .from('parents')
        .select('children')
        .eq('user_id', parentId)
        .single()

      const currentChildren = parentData?.children || []
      const updatedChildren = [...currentChildren, studentData.id]

      await supabase
        .from('parents')
        .update({ children: updatedChildren })
        .eq('user_id', parentId)

      // Reset form
      setChildData({ firstName: '', lastName: '', grade: '', dateOfBirth: '' })
      onChildAdded()
    } catch (err: any) {
      setError(err.message || 'Failed to add child')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">Add Your Child</CardTitle>
        <CardDescription>
          Create a learning profile for your child to start their educational journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={childData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={childData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="grade">Grade Level</Label>
            <Select onValueChange={(value) => handleInputChange('grade', value)} value={childData.grade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="K">Kindergarten</SelectItem>
                <SelectItem value="1">1st Grade</SelectItem>
                <SelectItem value="2">2nd Grade</SelectItem>
                <SelectItem value="3">3rd Grade</SelectItem>
                <SelectItem value="4">4th Grade</SelectItem>
                <SelectItem value="5">5th Grade</SelectItem>
                <SelectItem value="6">6th Grade</SelectItem>
                <SelectItem value="7">7th Grade</SelectItem>
                <SelectItem value="8">8th Grade</SelectItem>
                <SelectItem value="9">9th Grade</SelectItem>
                <SelectItem value="10">10th Grade</SelectItem>
                <SelectItem value="11">11th Grade</SelectItem>
                <SelectItem value="12">12th Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={childData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </div>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}