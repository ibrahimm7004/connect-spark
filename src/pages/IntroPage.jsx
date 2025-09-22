import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const IntroPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  const { signIn, signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()



  // ✅ Handle Google OAuth redirect
  useEffect(() => {
    if (user) {
      const flow = searchParams.get('flow')
      if (flow === 'signup') {
        // Redirect to signup page to check profile completion
        navigate('/signup?flow=signup')
      } else if (flow === 'login') {
        setLoading(false)
        checkProfileForLogin()
      }
    }
  }, [user, searchParams, navigate])

  // ✅ Check profile for Google login
  const checkProfileForLogin = async () => {
    try {
      console.log('🔍 ===== GOOGLE LOGIN PROFILE CHECK START =====')
      console.log('🔍 Checking profile for Google login...')
      console.log('👤 User ID:', user.id)
      console.log('👤 User email:', user.email)
      console.log('👤 User provider:', user.app_metadata?.provider)
      
      // Wait a moment to ensure any profile creation has completed
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, company, location, created_at')
        .eq('id', user.id)
        .maybeSingle()

      console.log('📊 Profile check result:', { 
        existingProfile, 
        profileError,
        profileExists: !!existingProfile
      })
      
      // Log the full profile object
      if (existingProfile) {
        console.log('📊 FULL PROFILE DATA:', JSON.stringify(existingProfile, null, 2))
      }

      if (profileError) {
        console.error('❌ Error querying profiles:', profileError)
        setError('Error checking profile. Please try again.')
        return
      }

      if (!existingProfile) {
        console.log('❌ No profile found for Google login')
        console.log('🔍 ===== GOOGLE LOGIN PROFILE CHECK END =====')
        setError('No profile exists. Please sign up first.')
        // Sign out the user since they shouldn't be logged in
        await supabase.auth.signOut()
        return
      }

      // ✅ Profile exists, check if it's complete
      const requiredFields = ['full_name', 'job_title', 'company', 'location']
      const completedFields = requiredFields.filter(field => 
        existingProfile[field] && existingProfile[field].trim() !== ''
      )
      
      console.log('📊 Profile completion check:', {
        requiredFields,
        completedFields,
        isCompleted: completedFields.length === requiredFields.length
      })

      if (completedFields.length !== requiredFields.length) {
        console.log('❌ Profile exists but is incomplete - user should complete signup')
        console.log('🔍 ===== GOOGLE LOGIN PROFILE CHECK END =====')
        setError('No profile exists. Please sign up first.')
        // Sign out the user since they shouldn't be logged in
        await supabase.auth.signOut()
        return
      }

      // ✅ Profile exists and is complete, proceed to end page
      console.log('✅ Profile found and complete, proceeding to end page')
      console.log('🔍 ===== GOOGLE LOGIN PROFILE CHECK END =====')
      navigate('/end')
    } catch (err) {
      console.error('❌ Error checking profile for login:', err)
      setError('Error checking profile. Please try again.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signIn(formData.email, formData.password)

      if (error || !data?.user) {
        setError("Invalid credentials")
        setLoading(false)
        return
      }

      // Login successful - go to end page
      navigate('/end')

    } catch (err) {
      setError("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = () => navigate('/signup')

  const handleGoogleSignIn = async () => {
    setLoading(true)

    try {
      const { error } = await signInWithGoogle('login')
      
      if (error) {
        setError('Google sign-in failed.')
        setLoading(false)
        return
      }

      // Google OAuth will redirect, then useEffect will handle navigation
      
    } catch (err) {
      setError('Google sign-in failed.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{
        background: 'linear-gradient(45deg, #443628 0%, #ED8A50 44%, #BF341E 100%)',
      }}
    >
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

          {/* Google Sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 mb-4 bg-white text-gray-700 font-sans font-medium hover:bg-gray-50 
                       transition disabled:opacity-50 rounded-[20px] text-[16px] flex items-center justify-center gap-3"
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
            <span className="px-2 font-sans font-normal text-gray-body text-[14px]">or</span>
            <hr className="flex-grow border-gray-body" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Email Login */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 mb-4 px-4 bg-white text-black rounded-[20px]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 mb-2 px-4 bg-white text-black rounded-[20px]"
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
              className="w-full h-12 text-white font-sans font-bold uppercase rounded-[20px] text-[16px]"
              style={{
                background: 'linear-gradient(128deg, #EC874E 0%, #BF341E 100%)',
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
              {' '}if you want to use INTRO at your event.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntroPage
