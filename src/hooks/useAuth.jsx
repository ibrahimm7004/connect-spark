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
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_KEY ? 'Present' : 'Missing')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session:', { session, error })
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, session })
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // The trigger will automatically create the public.profiles row
        // We just need to update it with additional data if provided
        if (userData && Object.keys(userData).length > 0) {
          const { data: upsertData, error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: data.user.id, ...userData })

          if (profileError) {
            console.error('Error updating profile:', profileError)
            // Continue anyway - don't block the signup process
          } else {
            const affected = Array.isArray(upsertData) ? upsertData.length : 0
            console.log('Profile upsert successful. Rows affected:', affected)
          }
        }

        // Force update user state
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

  // LinkedIn sign-in removed for MVP

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

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Update profile error:', error)
        // Don't show error toast for now - just log it
        return { error }
      }
      toast.success('Profile updated successfully')
      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      // Don't show error toast for now - just log it
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
