import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute  from './components/ProtectedRoute'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import DashboardPage   from './pages/DashboardPage'
import CreateJobPage   from './pages/CreateJobPage'
import UploadPage      from './pages/UploadPage'
import CandidatesPage  from './pages/CandidatesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/register"  element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/jobs/create" element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>} />
      <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
      <Route path="/candidates" element={<ProtectedRoute><CandidatesPage /></ProtectedRoute>} />
      <Route path="/"          element={<Navigate to="/dashboard" replace />} />
      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}