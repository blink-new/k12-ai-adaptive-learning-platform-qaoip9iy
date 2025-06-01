import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import AssessmentPage from './pages/AssessmentPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ParentDashboard from './pages/ParentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminSubjects from './pages/AdminSubjects'
import AdminTopics from './pages/AdminTopics'
import AdminLessons from './pages/AdminLessons'
import AdminQuestions from './pages/AdminQuestions'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="learning-platform-theme">
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/parent" element={<ProtectedRoute allowedRoles={["parent"]}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSubjects /></ProtectedRoute>} />
            <Route path="/admin/topics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTopics /></ProtectedRoute>} />
            <Route path="/admin/lessons" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLessons /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={["admin"]}><AdminQuestions /></ProtectedRoute>} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App