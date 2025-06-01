import { supabase, User, Session, AuthError } from './supabase'

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'student' | 'parent' | 'admin'
  grade?: string
}

export interface AuthResult {
  user?: User | null
  session?: Session | null
  error?: AuthError | null
}

export class AuthService {
  // Sign up new user
  static async signUp(data: RegisterData): Promise<AuthResult> {
    try {
      const { email, password, firstName, lastName, role, grade } = data

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      })

      if (authError) {
        return { error: authError }
      }

      if (!authData.user) {
        return { error: new Error('Failed to create user') as AuthError }
      }

      // Create profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          role,
          first_name: firstName,
          last_name: lastName,
          grade: role === 'student' ? grade : null
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // Create role-specific record
      if (role === 'student') {
        await supabase
          .from('students')
          .insert({
            user_id: authData.user.id,
            grade: grade || 'k',
            points: 0,
            streak_days: 0,
            weekly_goal: 20
          })
      } else if (role === 'parent') {
        await supabase
          .from('parents')
          .insert({
            user_id: authData.user.id,
            children: []
          })
      }

      return {
        user: authData.user as User,
        session: authData.session
      }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error }
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      return {
        user: profile as User,
        session: data.session
      }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error }
      }

      return { session: data.session }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign out
  static async signOut(): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<{ session?: Session; error?: AuthError }> {
    try {
      const { data, error } = await supabase.auth.getSession()
      return { session: data.session, error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<{ user?: User; error?: Error }> {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session?.user) {
        return { user: null }
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single()

      return { user: profile as User, error: error as Error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      return { error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }
}