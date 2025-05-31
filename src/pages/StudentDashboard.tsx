import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, MessageCircle, Sparkles, Star, Trophy, Zap, PlayCircle } from 'lucide-react'
import AITutorChat from '@/components/AITutorChat'
import InitialAssessment from '@/components/InitialAssessment'
import { useAuth } from '@/contexts/AuthContext'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { Progress } from '@/components/ui/progress'
import AssessmentSubmission from '@/components/AssessmentSubmission'
import { useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import Quiz from '@/components/Quiz'

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const [showChat, setShowChat] = React.useState(false)
  const [hasInitialAssessment, setHasInitialAssessment] = React.useState<boolean | null>(null)

  const [showAssessment, setShowAssessment] = React.useState(false)
  const [assessmentSubmitted, setAssessmentSubmitted] = React.useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [points, setPoints] = React.useState(2840)
  const [streakDays, setStreakDays] = React.useState(7)
  const badges = [
    { id: 1, title: 'Math Wizard', description: 'Completed 20 math lessons', icon: Trophy, earned: true },
    { id: 2, title: 'Speed Learner', description: 'Complete 5 lessons in one day', icon: Zap, earned: true },
    { id: 3, title: 'Reading Champion', description: 'Read 10 stories', icon: Trophy, earned: false },
  ]

  const [learningPath, setLearningPath] = useState<any[]>([])
  const [currentLesson, setCurrentLesson] = useState<any | null>(null)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [lessonContent, setLessonContent] = useState<any | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lessonError, setLessonError] = useState<string | null>(null)

  const [lessonQuestions, setLessonQuestions] = useState<any[]>([])
  const [showQuiz, setShowQuiz] = useState(false)

  const fetchLearningPath = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Check if user has completed initial assessment
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('id')
        .eq('student_id', user.id)
        .eq('assessment_type', 'initial')
        .eq('completed', true)
        .single()

      setHasInitialAssessment(!!assessmentData)

      // If no initial assessment, don't load learning path yet
      if (!assessmentData) {
        setLoading(false)
        return
      }

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name')
      if (subjectsError) throw subjectsError

      // For each subject, fetch topics
      const subjectsWithTopics = await Promise.all(
        subjectsData.map(async (subject: any) => {
          const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select('id, name, order')
            .eq('subject_id', subject.id)
            .order('order')
          if (topicsError) throw topicsError

          // For each topic, fetch lessons
          const topicsWithLessons = await Promise.all(
            topicsData.map(async (topic: any) => {
              const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('id, title, order')
                .eq('topic_id', topic.id)
                .order('order')
              if (lessonsError) throw lessonsError

              // For each lesson, fetch progress
              const lessonsWithProgress = await Promise.all(
                lessonsData.map(async (lesson: any) => {
                  const { data: progressData } = await supabase
                    .from('learning_progress')
                    .select('completed, score, time_spent')
                    .eq('student_id', user.id)
                    .eq('lesson_id', lesson.id)
                    .single()
                  return {
                    ...lesson,
                    progress: progressData || { completed: false, score: 0, time_spent: 0 },
                  }
                })
              )

              return {
                ...topic,
                lessons: lessonsWithProgress,
              }
            })
          )

          return {
            ...subject,
            topics: topicsWithLessons,
          }
        })
      )

      setLearningPath(subjectsWithTopics)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchLearningPath()
  }, [fetchLearningPath])

  // Mark lesson complete
  const markLessonComplete = async (lessonId: string) => {
    if (!user) return
    try {
      await supabase.from('learning_progress').upsert({
        student_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      setLessonCompleted(true)
      fetchLearningPath()
    } catch (error) {
      console.error('Failed to mark lesson complete', error)
    }
  }

  useEffect(() => {
    if (!currentLesson) {
      setLessonContent(null)
      setLessonError(null)
      return
    }
    setLessonLoading(true)
    setLessonError(null)
    supabase
      .from('lessons')
      .select('*')
      .eq('id', currentLesson.id)
      .single()
      .then(({ data, error }) => {
        if (error) setLessonError(error.message)
        else setLessonContent(data)
        setLessonLoading(false)
      })
  }, [currentLesson])

  useEffect(() => {
    if (!currentLesson) {
      setLessonQuestions([])
      setShowQuiz(false)
      return
    }
    supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', currentLesson.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch questions', error)
          setLessonQuestions([])
        } else {
          setLessonQuestions(data || [])
        }
      })
  }, [currentLesson])

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

  if (!hasInitialAssessment) {
    return (
      <InitialAssessment onComplete={() => {
        setHasInitialAssessment(true)
        fetchLearningPath()
      }} />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                LearnSmart
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="font-semibold text-orange-700">7 day streak!</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-700">2840 points</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Tutor
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user?.first_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to continue your learning adventure? You're doing amazing!
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <PlayCircle className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        </motion.div>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Learning Path</h2>
          {loading ? (
            <p>Loading learning path...</p>
          ) : learningPath.length === 0 ? (
            <p>No learning path available.</p>
          ) : (
            <div className="space-y-6">
              {learningPath.map(subject => (
                <Card key={subject.id} className="bg-white/70 backdrop-blur-sm rounded-lg shadow">
                  <CardHeader>
                    <CardTitle>{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subject.topics.map((topic: any) => (
                      <div key={topic.id} className="mb-4">
                        <h3 className="font-semibold mb-2">{topic.name}</h3>
                        <div className="space-y-2">
                          {topic.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer">
                              <div>
                                <span className={`font-medium ${lesson.progress.completed ? 'line-through text-gray-500' : ''}`}>{lesson.title}</span>
                                {lesson.progress.completed && <span className="ml-2 text-green-600">✓ Completed</span>}
                              </div>
                              {!lesson.progress.completed && (
                                <Button size="sm" onClick={() => setCurrentLesson(lesson)}>
                                  Start
                                </Button>
                              )}
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

        <Dialog open={!!currentLesson} onOpenChange={open => {
          if (!open) {
            setCurrentLesson(null)
            setLessonCompleted(false)
            setShowQuiz(false)
          }
        }}>
          <DialogContent className="max-w-3xl relative">
            <DialogTitle>{currentLesson?.title}</DialogTitle>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => {
                setCurrentLesson(null)
                setLessonCompleted(false)
                setShowQuiz(false)
              }}
              aria-label="Close"
            >
              ×
            </button>

            {!showQuiz ? (
              <>
                <div className="mt-4 min-h-[180px]">
                  {/* Render lesson content as before */}
                  {lessonLoading ? (
                    <div className="text-center text-gray-500">Loading lesson...</div>
                  ) : lessonError ? (
                    <div className="text-red-600">{lessonError}</div>
                  ) : lessonContent ? (
                    <div>
                      {lessonContent.content_type === 'markdown' && lessonContent.content_markdown && (
                        <div className="prose max-w-none bg-gray-50 rounded-lg p-4 shadow-inner animate-fade-in">
                          <ReactMarkdown>{lessonContent.content_markdown}</ReactMarkdown>
                        </div>
                      )}
                      {lessonContent.content_type === 'video' && lessonContent.content_url && (
                        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black animate-fade-in">
                          <iframe
                            src={lessonContent.content_url}
                            title="Lesson Video"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {lessonContent.content_type === 'quiz_link' && lessonContent.content_url && (
                        <div className="flex flex-col items-center animate-fade-in">
                          <Button
                            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full shadow"
                            onClick={() => window.open(lessonContent.content_url, '_blank')}
                          >
                            Go to Quiz
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400">No content available for this lesson.</div>
                  )}
                </div>

                {lessonQuestions.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Button onClick={() => setShowQuiz(true)}>
                      Take Quiz
                    </Button>
                  </div>
                )}

                {!lessonCompleted && (
                  <Button className="mt-6" onClick={() => { if (currentLesson) markLessonComplete(currentLesson.id) }}>
                    Mark as Complete
                  </Button>
                )}

                {lessonCompleted && <p className="mt-6 text-green-600 font-semibold animate-fade-in">Lesson completed! Great job!</p>}
              </>
            ) : (
              <Quiz
                questions={lessonQuestions}
                onComplete={(score, total) => {
                  setShowQuiz(false)
                  alert(`You scored ${score} out of ${total}!`)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{activity.activity_type}</p>
                    <p className="text-sm text-gray-600">{activity.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Duration: {activity.duration_minutes} min</p>
                    <p className="text-sm">Points: {activity.points_earned}</p>
                    <p className="text-sm">Accuracy: {activity.accuracy}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{new Date(activity.completed_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Achievements</h2>
          <div className="flex space-x-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-lg p-6 flex flex-col items-center justify-center shadow-lg w-40">
              <Trophy className="h-10 w-10 mb-2" />
              <p className="text-lg font-bold">{points} Points</p>
            </div>
            <div className="bg-gradient-to-br from-red-400 to-red-500 text-white rounded-lg p-6 flex flex-col items-center justify-center shadow-lg w-40">
              <Zap className="h-10 w-10 mb-2" />
              <p className="text-lg font-bold">{streakDays} Day Streak</p>
            </div>
            <div className="flex space-x-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg shadow-lg flex flex-col items-center justify-center w-32 ${badge.earned ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600 opacity-60'}`}
                >
                  <badge.icon className="h-8 w-8 mb-2" />
                  <p className="font-semibold">{badge.title}</p>
                  <p className="text-sm text-center">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow ${achievement.earned_at ? 'border-2 border-yellow-400' : 'opacity-60'}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold">{achievement.title}</h3>
                </div>
                <p className="text-gray-700">{achievement.description}</p>
                {achievement.earned_at && <p className="text-sm text-yellow-600 mt-2">Earned on {new Date(achievement.earned_at).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Assessment</h2>
          {!assessmentSubmitted ? (
            <>
              {!showAssessment ? (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => setShowAssessment(true)}
                >
                  Start Assessment
                </button>
              ) : (
                <AssessmentSubmission
                  questionId="sample-question-1"
                  questionText="What is 2 + 2?"
                  onSubmitted={() => {
                    setAssessmentSubmitted(true)
                    setShowAssessment(false)
                  }}
                />
              )}
            </>
          ) : (
            <p className="text-green-700 font-semibold">Thank you for completing the assessment!</p>
          )}
        </section>
        {showChat && <AITutorChat />}
      </main>
    </div>
  )
}