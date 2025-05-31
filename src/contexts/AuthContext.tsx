import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as AppUser } from '@/lib/supabase'
import { AuthService, RegisterData } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: RegisterData) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const getRedirectPathForRole = (role: string) => {
  switch (role) {
    case 'student':
      return '/student'
    case 'parent':
      return '/parent'
    case 'admin':
      return '/admin'
    default:
      return '/login'
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { user: currentUser } = await AuthService.getCurrentUser()
        setUser(currentUser || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { user: currentUser } = await AuthService.getCurrentUser()
            setUser(currentUser || null)
          } catch (error) {
            console.error('Error fetching user profile:', error)
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Runtime check for missing Supabase client
  if (!supabase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Supabase is not initialized</h1>
        <p className="text-gray-700 mb-2">The app cannot connect to the backend. This usually means the required environment variables are missing in the deployment environment.</p>
        <p className="text-gray-500 text-sm">Please check that <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> are set as secrets in your Blink project.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const signIn = async (email: string, password: string) => {
    const { user: signedInUser, error } = await AuthService.signIn(email, password)
    if (error) {
      throw error
    }
    setUser(signedInUser || null)
  }

  const signUp = async (data: RegisterData) => {
    const { user: newUser, error } = await AuthService.signUp(data)
    if (error) {
      throw error
    }
    setUser(newUser || null)
  }

  const signOut = async () => {
    const { error } = await AuthService.signOut()
    if (error) {
      throw error
    }
    setUser(null)
  }

  const signInWithGoogle = async () => {
    const { error } = await AuthService.signInWithGoogle()
    if (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}