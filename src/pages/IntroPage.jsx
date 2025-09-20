import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const IntroPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

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
    try {
      const { data, error } = await signIn(formData.email, formData.password)
      if (!error && data?.user) {
        try {
          // 1) Check profile completeness (signup2)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, job_title, company, bio, location')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            console.error('Error loading profile for redirect:', profileError)
          }

          const requiredFields = ['full_name', 'job_title', 'company', 'bio', 'location']
          const isMissing = !profile || requiredFields.some((key) => !profile?.[key] || String(profile[key]).trim() === '')
          if (isMissing) {
            console.log('Redirect: profile incomplete -> /questions')
            navigate('/questions')
            return
          }

          // 2) Check event_answers (why-join)
          const { data: answers, error: answersError } = await supabase
            .from('event_answers')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle()

          if (answersError) {
            console.error('Error checking event_answers:', answersError)
          }

          if (!answers) {
            console.log('Redirect: no event_answers -> /why-join')
            navigate('/why-join')
          } else {
            console.log('Redirect: onboarding complete -> /end')
            navigate('/end')
          }
        } catch (redirectErr) {
          console.error('Redirect check error:', redirectErr)
          navigate('/questions')
        }
      } else alert('Login failed. Please check your credentials.')
    } catch (error) {
      console.error('Auth error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // LinkedIn sign-in removed for MVP

  const handleSignUp = () => navigate('/signup')

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

          {/* LinkedIn removed for MVP */}

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
