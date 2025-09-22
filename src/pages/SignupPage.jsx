import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const SignupPage = () => {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, user } = useAuth()
  const [searchParams] = useSearchParams()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasAttemptedSignup, setHasAttemptedSignup] = useState(false)

  useEffect(() => {
    const flow = searchParams.get('flow')
    console.log('🔄 SignupPage useEffect triggered:', { 
      user: !!user, 
      hasAttemptedSignup, 
      userId: user?.id,
      flow,
      isGoogleSignup: flow === 'signup' && user?.app_metadata?.provider === 'google'
    })
    
    // Check if this is a Google signup (either from state or URL parameter)
    const isGoogleSignup = (user && hasAttemptedSignup) || (user && flow === 'signup' && user?.app_metadata?.provider === 'google')
    
    if (isGoogleSignup) {
      console.log('✅ Google signup detected, calling checkProfileAndNavigate')
      setLoading(false)
      checkProfileAndNavigate()
    }
  }, [user, hasAttemptedSignup, searchParams, navigate])

  const checkProfileAndNavigate = async () => {
    try {
      console.log('🔍 ===== PROFILE CHECK START =====')
      console.log('🔍 User ID:', user.id)
      console.log('🔍 User email:', user.email)
      console.log('🔍 User created at:', user.created_at)
      console.log('🔍 User provider:', user.app_metadata?.provider)
      
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
        profileExists: !!existingProfile,
        profileId: existingProfile?.id,
        profileName: existingProfile?.full_name,
        profileCreatedAt: existingProfile?.created_at
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

      if (existingProfile) {
        console.log('📊 Profile exists, checking if it\'s completed...')
        console.log('📊 Profile data:', existingProfile)
        
        // Check if profile is completed (has required fields)
        const requiredFields = ['full_name', 'job_title', 'company', 'location']
        const completedFields = requiredFields.filter(field => 
          existingProfile[field] && existingProfile[field].trim() !== ''
        )
        
        console.log('📊 Profile completion check:', {
          requiredFields,
          completedFields,
          isCompleted: completedFields.length === requiredFields.length,
          userProvider: user.app_metadata?.provider
        })
        
        if (completedFields.length === requiredFields.length) {
          console.log('❌ Profile is already completed - user should login instead')
          setError('Profile already exists with this email. Please log in instead.')
          // Sign out the user since we don't want them logged in
          await supabase.auth.signOut()
          return
        } else {
          console.log('✅ Profile exists but is incomplete - proceeding with signup flow')
          setError('')
          navigate('/questions')
          return
        }
      }

      // ✅ No existing profile, proceed with signup flow
      console.log('✅ No existing profile found, proceeding to questions')
      console.log('✅ This is a new user signup')
      console.log('🔍 ===== PROFILE CHECK END =====')
      // Clear any previous errors
      setError('')
      navigate('/questions')
    } catch (err) {
      console.error('❌ Error checking profile:', err)
      setError('Error checking profile. Please try again.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 Attempting signup for:', formData.email)
      
      const { data, error } = await signUp(formData.email, formData.password)

      if (error) {
        console.log('❌ Signup error:', error.message)
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError('Profile already exists with this email. Please log in instead.')
        } else {
          setError(error.message || 'Signup failed.')
        }
        setLoading(false)
        return
      }

      // ✅ Signup successful - proceed with signup flow
      if (data?.user) {
        console.log('✅ User created successfully, proceeding with signup flow')
        setHasAttemptedSignup(true)
        // useEffect will handle navigation to /questions
      }
    } catch (err) {
      console.error('❌ Signup error:', err)
      setError('Signup failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setHasAttemptedSignup(true)

    try {
      const { error } = await signInWithGoogle('signup')
      if (error) {
        setError(error.message || 'Google signup failed.')
        setHasAttemptedSignup(false)
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Google signup error:', err)
      setError('Google signup failed.')
      setHasAttemptedSignup(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-brand-dark">
      <div className="w-full max-w-[430px] min-h-[932px] flex flex-col px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-6 h-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#F9F9F9"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center font-sans text-[20px] font-bold uppercase text-[#EC874E]">
            Sign Up
          </h1>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-[20px] 
                     bg-gradient-to-r from-[#EC874E] to-[#BF341E] text-white 
                     font-sans font-normal text-[16px] mb-6 disabled:opacity-50 hover:opacity-90 transition"
        >
          <div className="bg-white rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
              <path fill="#EA4335" d="M24 9.5c3.94 0 6.6 1.69 8.12 3.11l5.94-5.94C34.44 3.2 29.77 1 24 1 14.61 1 6.6 6.16 3.23 13.49l6.87 5.35C11.64 13.2 17.27 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.67 24.5c0-1.51-.14-2.96-.39-4.36H24v8.27h12.67c-.54 2.9-2.12 5.36-4.51 7.02l7.11 5.54C43.78 37.15 46.67 31.32 46.67 24.5z"/>
              <path fill="#FBBC05" d="M10.1 28.17c-.5-1.47-.79-3.03-.79-4.67s.29-3.2.79-4.67L3.23 13.49C1.77 16.5 1 20.12 1 24s.77 7.5 2.23 10.51l6.87-5.34z"/>
              <path fill="#4285F4" d="M24 47c5.77 0 10.64-1.91 14.18-5.18l-7.11-5.54c-1.99 1.34-4.54 2.12-7.07 2.12-6.73 0-12.36-3.7-15.9-9.35l-6.87 5.34C6.6 41.84 14.61 47 24 47z"/>
            </svg>
          </div>
          <span>{loading ? 'Signing up...' : 'Sign up with Google'}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <hr className="flex-grow border-gray-body" />
          <span className="px-2 font-sans font-normal text-gray-body text-[14px]">or</span>
          <hr className="flex-grow border-gray-body" />
        </div>

        {/* Email Signup */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[20px] bg-gradient-to-r from-[#EC874E] to-[#BF341E] 
                       text-white font-sans text-[16px] font-bold uppercase mt-6 
                       disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
