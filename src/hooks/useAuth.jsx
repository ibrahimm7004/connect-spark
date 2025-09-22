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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.id)
      console.log('🔐 User provider:', session?.user?.app_metadata?.provider)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user && event === 'SIGNED_IN') {
        // Only create profile for Google users (they have user_metadata)
        if (session.user.app_metadata?.provider === 'google') {
          console.log('🔐 Creating profile for Google user')
          await handleGoogleUserProfile(session.user)
        } else {
          console.log('🔐 Email user - NOT creating profile automatically')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ✅ Email/Password signup
  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('User already exists. Please log in instead.')
        } else {
          toast.error(error.message)
        }
        return { data: null, error }
      }

      if (data.user) {
        if (userData && Object.keys(userData).length > 0) {
          await supabase.from('profiles').upsert({ id: data.user.id, ...userData })
        }
        setUser(data.user)
        // Don't show toast here - let the calling component handle success/error messages
      }

      return { data, error: null }
    } catch (err) {
      console.error('❌ Sign up error:', err)
      toast.error(err.message)
      return { data: null, error: err }
    }
  }

  // ✅ Email/Password login
  const signIn = async (email, password) => {
    try {
      console.log('useAuth signIn called with:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('Supabase auth response:', { data, error })

      if (error) {
        console.error('Supabase auth error:', error)
        toast.error('Invalid email or password')
        return { data: null, error }
      }

      if (data.user) {
        console.log('User authenticated:', data.user.id)
        // Don't set user state here - let the auth state change listener handle it
        toast.success('Logged in successfully!')
      }

      return { data, error: null }
    } catch (err) {
      console.error('❌ Sign in error:', err)
      toast.error(err.message)
      return { data: null, error: err }
    }
  }

  // ✅ Google login/signup
  const signInWithGoogle = async (flow = 'login') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/?flow=${flow}`,
        },
      })

      if (error) {
        toast.error(`Google ${flow} failed: ${error.message}`)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('❌ Google sign-in error:', err)
      toast.error(err.message)
      return { data: null, error: err }
    }
  }

  // ✅ Ensure Google user has a profile row
  const handleGoogleUserProfile = async (user) => {
    try {
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existing) {
        await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          profile_pic: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        })
      }
    } catch (err) {
      console.error('❌ Google profile creation error:', err)
    }
  }

  // ✅ Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      toast.success('Signed out successfully')
    } catch (err) {
      console.error('❌ Sign out error:', err)
      toast.error(err.message)
    }
  }

  // ✅ Update profile (INSERT or UPDATE)
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated')

      console.log('🔄 Updating profile for user:', user.id)
      console.log('📝 Updates:', updates)

      // Use upsert to handle both INSERT and UPDATE
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates }, { onConflict: 'id' })

      if (error) {
        console.error('❌ Profile upsert error:', error)
        return { error }
      }

      console.log('✅ Profile upserted successfully')
      toast.success('Profile updated successfully')
      return { error: null }
    } catch (err) {
      console.error('❌ Profile update error:', err)
      return { error: err }
    }
  }

  // ✅ Check onboarding status
  const checkOnboardingStatus = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, job_title, company, location')
        .eq('id', userId)
        .maybeSingle()

      if (!profile) return { status: 'no_profile', redirectTo: '/questions' }

      const requiredFields = ['full_name', 'job_title', 'company', 'location']
      const missing = requiredFields.filter(
        (f) => !profile?.[f] || String(profile[f]).trim() === ''
      )

      if (missing.length > 0) return { status: 'incomplete_profile', redirectTo: '/questions' }

      const { data: answers } = await supabase
        .from('event_answers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!answers) return { status: 'no_event_answers', redirectTo: '/why-join' }

      return { status: 'complete', redirectTo: '/end' }
    } catch (err) {
      console.error('❌ Onboarding check error:', err)
      return { status: 'error', redirectTo: '/questions' }
    }
  }

  // ✅ Navigate after login/signup
  const handlePostLoginNavigation = async (userId, navigate) => {
    const { redirectTo } = await checkOnboardingStatus(userId)
    navigate(redirectTo)
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
