import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const IntroPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false)

  const { signIn, signInWithGoogle, handlePostLoginNavigation, checkUserOnboarding, user } = useAuth()
  const navigate = useNavigate()

  // Handle auth state changes (for Google OAuth) - only after login attempts
  useEffect(() => {
    if (user && hasAttemptedLogin) {
      console.log('🔍 User detected after login attempt, checking onboarding status...')
      checkUserOnboarding(user, navigate)
    }
  }, [user, navigate, checkUserOnboarding, hasAttemptedLogin])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    setHasAttemptedLogin(true) // Mark that user has attempted login
    try {
      const { data, error } = await signIn(formData.email, formData.password)
      if (!error && data?.user) {
        console.log('✅ Login successful, checking onboarding status...')
        
        // Use the helper function to handle post-login navigation
        await handlePostLoginNavigation(data.user.id, navigate)
      } else {
        console.error('❌ Login failed:', error)
        alert('Login failed. Please check your credentials.')
        setHasAttemptedLogin(false) // Reset flag on failed login
      }
    } catch (error) {
      console.error('❌ Auth error:', error)
      alert('Login failed. Please try again.')
      setHasAttemptedLogin(false) // Reset flag on error
    } finally {
      setLoading(false)
    }
  }

  // LinkedIn sign-in removed for MVP

  const handleSignUp = () => navigate('/signup')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setHasAttemptedLogin(true) // Mark that user has attempted login
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Google sign-in error:', error)
        alert('Google sign-in failed. Please try again.')
        setHasAttemptedLogin(false) // Reset flag on failed login
      }
      // Note: Navigation will be handled by the useEffect when user state changes
    } catch (error) {
      console.error('Google sign-in error:', error)
      alert('Google sign-in failed. Please try again.')
      setHasAttemptedLogin(false) // Reset flag on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{
        background:
          'linear-gradient(45deg, #443628 0%, #ED8A50 44%, #BF341E 100%)',
      }}
    >
      {/* Mobile frame */}
      <div className="w-full max-w-[430px] min-h-[932px] flex flex-col">
        {/* Header */}
        <div className="pt-16 text-center px-6">
          <p className="font-sans font-normal text-[18px] leading-[32px] text-brand-dark">
            The Best Way to Network
          </p>
          <h1
            className="mt-2 font-display text-[80px] uppercase text-brand-dark"
            style={{ textShadow: '0 4px 0 #B31F19' }}
          >
            INTRO
          </h1>
        </div>

        {/* Dark Sheet */}
        <div className="mt-8 rounded-t-[20px] px-6 pt-8 pb-10 flex-1 shadow-lg bg-brand-dark">
          <h2 className="font-sans font-bold text-center uppercase text-white text-[22px] mb-6">
            WELCOME!
          </h2>
          <p className="font-sans font-medium text-white text-[20px] leading-[24px] mb-8 text-left">
            Log in/Sign up
          </p>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 mb-4 bg-white text-gray-700 font-sans font-medium hover:bg-gray-50 transition disabled:opacity-50 rounded-[20px] text-[16px] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-body" />
            <span className="px-2 font-sans font-normal text-gray-body text-[14px]">
              or
            </span>
            <hr className="flex-grow border-gray-body" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 mb-4 px-4 bg-white text-black focus:outline-none font-sans placeholder-gray-light text-[16px] rounded-[20px]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 mb-2 px-4 bg-white text-black focus:outline-none font-sans placeholder-gray-light text-[16px] rounded-[20px]"
              required
            />

            <div className="text-right mb-6">
              <button
                type="button"
                onClick={() => alert('Forgot password not implemented yet')}
                className="font-sans font-normal underline text-gray-body text-[14px]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-sans font-bold uppercase hover:opacity-90 transition disabled:opacity-50 rounded-[20px] text-[16px]"
              style={{
                background:
                  'linear-gradient(128deg, #EC874E 0%, #BF341E 100%)',
              }}
            >
              {loading ? 'PROCESSING...' : 'LOG IN'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="font-sans font-normal text-gray-body text-[16px]">
              Don’t have an account?{' '}
            </span>
            <span
              onClick={handleSignUp}
              className="cursor-pointer hover:underline font-sans font-normal text-brand-orange text-[16px]"
            >
              Sign up
            </span>
          </div>

          <div className="mt-2 text-center">
            <span
              onClick={() => alert('Contact us not implemented yet')}
              className="cursor-pointer hover:underline font-sans font-normal text-brand-orange text-[16px]"
            >
              Contact us
            </span>
            <span className="font-sans font-normal text-gray-body text-[16px]">
              {' '}
              if you want to use INTRO at your event.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntroPage
