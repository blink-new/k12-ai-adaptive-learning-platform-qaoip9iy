import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

export default function LoginPage() {
  const { signIn, signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if user is already logged in
  if (user) {
    navigate(user.role === 'admin' ? '/admin' : user.role === 'parent' ? '/parent' : '/student', { replace: true })
    return null // Prevent rendering login form while redirecting
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    try {
      await signIn(email, password)
      // Redirect based on role
      // The AuthContext handles setting the user, and the check above redirects
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      // The AuthContext handles setting the user, and the check above redirects
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 font-sans">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto animate-fade-in-up shadow-xl rounded-2xl bg-white/90 p-8 mt-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center tracking-tight">Sign In</h1>
          {error && (
            <div className="mb-4 rounded-lg shadow bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-center text-base animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 text-base px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
            <Button type="submit" className="w-full text-lg py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all shadow-md" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6">
            <Button variant="outline" className="w-full text-lg py-3 rounded-lg font-semibold border-blue-400 text-blue-600 hover:bg-blue-50 transition-all shadow" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? 'Loading...' : 'Sign in with Google'}
            </Button>
          </div>
          <p className="mt-6 text-center text-base text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Register
            </Link>
          </p>
          <p className="mt-4 text-center text-base text-gray-600">
            Are you an admin?{' '}
            <Link to="/admin-login" className="text-blue-600 hover:underline font-semibold">
              Admin Login
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