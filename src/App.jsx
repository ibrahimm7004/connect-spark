import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'

// Pages
import IntroPage from './pages/IntroPage'
import SignupPage from './pages/SignupPage'
import SignupQuestionsPage from './pages/SignupQuestionsPage'
import SignedUp from './pages/SignedUp'
import WhyJoinPage from './pages/WhyJoinPage'
import EndPage from './pages/EndPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/questions" element={<SignupQuestionsPage />} />
            <Route path="/signed-up" element={<SignedUp />} />
            <Route path="/why-join" element={<WhyJoinPage />} />
            <Route path="/end" element={<EndPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
