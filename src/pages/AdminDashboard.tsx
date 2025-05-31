import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { LogOut, BookOpen } from 'lucide-react'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('users').select('id, email, role, first_name, last_name, grade')
      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }
      setLoading(false)
    }

    fetchUsers()
  }, [user])

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)
    if (error) {
      console.error('Error updating user role:', error)
      return
    }
    setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-700">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Role</th>
                  <th className="py-3 px-6 text-left">Grade</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6">{u.first_name} {u.last_name}</td>
                    <td className="py-3 px-6">{u.email}</td>
                    <td className="py-3 px-6 capitalize">{u.role}</td>
                    <td className="py-3 px-6">{u.grade || '-'}</td>
                    <td className="py-3 px-6">
                      {u.role !== 'admin' && (
                        <Button
                          size="sm"
                          onClick={() => handleRoleChange(u.id, u.role === 'student' ? 'parent' : 'student')}
                        >
                          Promote to {u.role === 'student' ? 'Parent' : 'Student'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Platform Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white p-6 rounded-lg shadow">
              <CardTitle>Total Users</CardTitle>
              <CardContent className="text-3xl font-bold">
                {users.length}
              </CardContent>
            </Card>
            {/* Add more analytics cards here */}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/subjects">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-700">Manage Subjects</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/topics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-700">Manage Topics</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/lessons">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium text-gray-700">Manage Lessons</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/questions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <BookOpen className="h-8 w-8 text-red-600 mb-2" />
                  <p className="font-medium text-gray-700">Manage Questions</p>
                </CardContent>
              </Card>
            </Link>
            {/* Add links to Lessons, Questions here later */}
          </div>
        </section>
      </main>
    </div>
  )
}