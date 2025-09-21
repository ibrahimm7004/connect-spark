import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Email/Password signup
  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Auto-insert profile row via Supabase trigger
        if (userData && Object.keys(userData).length > 0) {
          await supabase
            .from('profiles')
            .upsert({ id: data.user.id, ...userData })
        }

        setUser(data.user)
        toast.success('Account created successfully!')
      }

      return { data, error }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message)
      return { data: null, error }
    }
  }

  // Email/Password login
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message)
      return { data: null, error }
    }
  }

  // Google OAuth signup/login
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
      if (error) throw error
      return { data, error }
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error(error.message)
      return { data: null, error }
    }
  }

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error(error.message)
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Update profile error:', error)
        return { error }
      }

      toast.success('Profile updated successfully')
      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    }
  }

  // ✅ Handle post-login navigation
  const handlePostLoginNavigation = async (userId, navigate) => {
    try {
      const { status, redirectTo } = await checkOnboardingStatus(userId)
      console.log(`🔄 Post-login navigation: ${status} -> ${redirectTo}`)
      navigate(redirectTo)
    } catch (error) {
      console.error('❌ Error in post-login navigation:', error)
      navigate('/questions') // Fallback
    }
  }

  // ✅ Check if user needs onboarding after auth state change
  const checkUserOnboarding = async (user, navigate) => {
    if (user && navigate) {
      console.log('🔍 Auth state changed, checking onboarding for user:', user.id)
      await handlePostLoginNavigation(user.id, navigate)
    }
  }

  // ✅ Complete onboarding check
  const checkOnboardingStatus = async (userId) => {
    try {
      console.log('🔍 Checking onboarding status for user:', userId)
      
      // 1) Check if profile exists and is complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, job_title, company, location')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('❌ Error loading profile:', profileError)
        // If profile doesn't exist (PGRST116 = no rows returned)
        if (profileError.code === 'PGRST116') {
          console.log('🔄 No profile found -> /questions')
          return { status: 'no_profile', redirectTo: '/questions' }
        }
        // Other database errors
        console.log('🔄 Profile error -> /questions')
        return { status: 'error', redirectTo: '/questions' }
      }

      // Check if all required profile fields are present and not empty
      const requiredFields = ['full_name', 'job_title', 'company', 'location']
      const missingFields = requiredFields.filter(field => 
        !profile?.[field] || String(profile[field]).trim() === ''
      )

      if (missingFields.length > 0) {
        console.log('🔄 Profile incomplete, missing:', missingFields, '-> /questions')
        return { status: 'incomplete_profile', redirectTo: '/questions' }
      }

      console.log('✅ Profile complete, checking event answers...')

      // 2) Check if event_answers exist
      const { data: answers, error: answersError } = await supabase
        .from('event_answers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (answersError) {
        console.error('❌ Error checking event_answers:', answersError)
        // Even if there's an error checking answers, if profile is complete, 
        // we should still check if they need to answer event questions
        console.log('🔄 Event answers error, assuming no answers -> /why-join')
        return { status: 'no_event_answers', redirectTo: '/why-join' }
      }

      if (!answers) {
        console.log('🔄 No event answers found -> /why-join')
        return { status: 'no_event_answers', redirectTo: '/why-join' }
      }

      console.log('✅ Onboarding complete -> /end')
      return { status: 'complete', redirectTo: '/end' }
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error)
      console.log('🔄 Fallback -> /questions')
      return { status: 'error', redirectTo: '/questions' }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    checkOnboardingStatus,
    handlePostLoginNavigation,
    checkUserOnboarding,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
