import { createClient } from '@supabase/supabase-js'
import type { Session, AuthError } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    // Show a user-friendly error in the browser
    document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1 style="color:#e11d48;">Missing Supabase environment variables</h1><p style="color:#334155;max-width:400px;text-align:center;">This app cannot connect to the backend because the required environment variables are not set. Please check your deployment settings for <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b>.</p></div>'
  }
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export types for use in other files
export type { Session, AuthError }

// Database types
export interface User {
  id: string
  email: string
  role: 'student' | 'parent' | 'admin'
  first_name: string
  last_name: string
  grade?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string
  grade: string
  points: number
  streak_days: number
  weekly_goal: number
  created_at: string
  updated_at: string
}

export interface Parent {
  id: string
  user_id: string
  children: string[] // Array of student IDs
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  student_id: string
  subject: string
  score: number
  difficulty_level: number
  questions_answered: number
  time_spent: number, // in seconds
  completed_at: string
}

export interface LearningProgress {
  id: string
  student_id: string
  subject: string
  lesson_id: string
  progress_percentage: number
  completed: boolean
  score?: number
  time_spent: number, // in seconds
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  student_id: string
  type: string
  title: string
  description: string
  earned_at: string
}