import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Demo: Only allow a specific admin email
    if (email === 'admin@learnsmart.com' && password === 'demo123') {
      navigate('/admin')
    } else {
      setError('Invalid admin credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <p className="text-gray-500 text-sm mt-2">Restricted access</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleLogin} autoComplete="off">
              <div>
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
                <Lock className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
