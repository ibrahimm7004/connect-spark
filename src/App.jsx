import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'

// MVP Pages
import SignupPage from './pages/SignupPage'
import SignupQuestionsPage from './pages/SignupQuestionsPage'
import WhyJoinPage from './pages/WhyJoinPage'
import EndPage from './pages/EndPage'
import IntroPage from './pages/IntroPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Entry route */}
            <Route path="/" element={<IntroPage />} />

            {/* MVP routes */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/questions" element={<SignupQuestionsPage />} />
            <Route path="/why-join" element={<WhyJoinPage />} />
            <Route path="/end" element={<EndPage />} />

            {/* Redirect unknown routes to / */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
