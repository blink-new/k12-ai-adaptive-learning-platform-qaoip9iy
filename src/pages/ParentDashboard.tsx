import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Zap, Star, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ParentDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [childProgress, setChildProgress] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [children, setChildren] = useState<any[]>([])

  const fetchParentData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Fetch child ID
      const { data: profile, error: profileError } = await supabase.from('profiles').select('child_id').eq('id', user.id).single()
      if (profileError) throw profileError
      if (!profile?.child_id) {
        setLoading(false)
        setError('No child linked to this parent account.')
        return
      }
      const childId = profile.child_id

      // Fetch learning path with nested topics and lessons and child's progress
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, topics(id, name, order, lessons(id, title, order))')
        .order('name')
        .order('order', { foreignTable: 'topics' })
        .order('order', { foreignTable: 'topics.lessons' })

      if (subjectsError) throw subjectsError

      // Fetch child's learning progress for all lessons
      const { data: progressData, error: progressError } = await supabase
        .from('learning_progress')
        .select('lesson_id, completed, score, time_spent')
        .eq('student_id', childId)

      if (progressError) throw progressError

      // Map progress data to the learning path structure
      const learningPathWithProgress = subjectsData.map(subject => ({
        ...subject,
        topics: subject.topics.map(topic => ({
          ...topic,
          lessons: topic.lessons.map(lesson => ({
            ...lesson,
            progress: progressData.find(p => p.lesson_id === lesson.id) || { completed: false, score: 0, time_spent: 0 }
          }))
        }))
      }))

      setChildProgress(learningPathWithProgress)

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('learning_sessions')
        .select('subject, activity_type, duration_minutes, points_earned, accuracy, completed_at')
        .eq('student_id', childId)
        .order('completed_at', { ascending: false })
        .limit(5)
      if (activityError) console.error('Error fetching child recent activity:', activityError)
      else setRecentActivity(activityData || [])

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', childId)
      if (achievementsError) console.error('Error fetching child achievements:', achievementsError)
      else setAchievements(achievementsData || [])

      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('profiles')
        .select('id, child_id')
        .eq('parent_id', user.id)
      if (childrenError) console.error('Error fetching children:', childrenError)
      else setChildren(childrenData || [])

    } catch (error: any) {
      console.error('Error fetching parent dashboard data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchParentData()
  }, [fetchParentData])

  useEffect(() => {
    if (children.length === 0 && !loading) {
      navigate('/add-first-child', { replace: true })
    }
  }, [children, loading, navigate])

  if (!user || !user.role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-bold text-red-600 mb-4">User profile is missing or incomplete.</div>
        <div className="text-gray-700 mb-2">This usually means your account was not set up correctly or the role field is missing.</div>
        <div className="text-gray-500">Please contact support or try registering again.</div>
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-bold text-red-600 mb-4">Error loading dashboard.</div>
        <div className="text-gray-700 mb-2">{error}</div>
        <div className="text-gray-500">Please try again later or contact support.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Parent Dashboard</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Child's Progress</h2>
          {childProgress.length === 0 ? (
            <p className="text-gray-600">No progress data available for your child.</p>
          ) : (
            <div className="space-y-6">
              {childProgress.map((subject) => (
                <Card key={subject.id} className="bg-white rounded-lg shadow">
                  <CardHeader>
                    <CardTitle>{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* TODO: Calculate and display overall subject progress */}
                    {subject.topics.map((topic: any) => (
                      <div key={topic.id} className="mb-4">
                        <h3 className="font-semibold mb-2">{topic.name}</h3>
                        {/* TODO: Calculate and display overall topic progress */}
                        <div className="space-y-2">
                          {topic.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between p-2 rounded">
                              <div>
                                <span className={`font-medium ${lesson.progress.completed ? 'text-green-700' : 'text-gray-700'}`}>{lesson.title}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {lesson.progress.completed ? (
                                  <span>Completed</span>
                                ) : (
                                  <span>Not Started</span>
                                )}
                                {lesson.progress.score > 0 && <span className="ml-2">Score: {lesson.progress.score}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-600">No recent activity available.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Card key={index} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{activity.activity_type}</p>
                      <p className="text-sm text-gray-600">{activity.subject}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Duration: {activity.duration_minutes} min</p>
                      <p>Points: {activity.points_earned}</p>
                      <p>Accuracy: {activity.accuracy}%</p>
                      <p>{new Date(activity.completed_at).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
          {achievements.length === 0 ? (
            <p className="text-gray-600">No achievements earned yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`bg-white rounded-lg p-6 shadow ${achievement.earned_at ? 'border-2 border-yellow-400' : 'opacity-60'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Trophy className="h-6 w-6 text-yellow-400" /> {/* Using Trophy icon for all achievements for now */}
                    <h3 className="text-lg font-semibold">{achievement.title}</h3>
                  </div>
                  <p className="text-gray-700">{achievement.description}</p>
                  {achievement.earned_at && <p className="text-sm text-yellow-600 mt-2">Earned on {new Date(achievement.earned_at).toLocaleDateString()}</p>}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* TODO: Add Notifications Section */}

      </main>
    </div>
  );
}