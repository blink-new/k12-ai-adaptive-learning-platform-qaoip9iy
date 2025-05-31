import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'

export default function RegisterPage() {
  const { signUp, user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    childFirstName: '',
    childLastName: '',
    childGrade: ''
  })
  const [selectedRole, setSelectedRole] = useState('student')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if user is already logged in
  if (user) {
    navigate(user.role === 'admin' ? '/admin' : user.role === 'parent' ? '/parent' : '/student', { replace: true })
    return null // Prevent rendering registration form while redirecting
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        grade: formData.grade
      })
      // Redirect based on role
      // The AuthContext handles setting the user, and the check above redirects
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 font-sans">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto animate-fade-in-up shadow-xl rounded-2xl bg-white/90 p-8 mt-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center tracking-tight">Join LearnSmart</h1>
          {error && (
            <div className="mb-4 rounded-lg shadow bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-center text-base animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-base font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-base font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role" className="text-base font-medium">I am a</Label>
              <Select onValueChange={setSelectedRole} value={selectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'student' && (
              <div>
                <Label htmlFor="grade" className="text-base font-medium">Grade</Label>
                <Select onValueChange={(value) => handleInputChange('grade', value)} value={formData.grade}>
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
            )}

            <Button type="submit" className="w-full text-lg py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all shadow-md" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-base text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  )
}