import { createContext, useContext, useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('mockUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signUp = async (email, password, userData) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: Date.now().toString(),
        email,
        ...userData,
        created_at: new Date().toISOString()
      }
      
      // Store in localStorage
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      setUser(mockUser)
      
      toast.success('Account created successfully!')
      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('Failed to create account')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('mockUser')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.email === email) {
          setUser(user)
          toast.success('Signed in successfully!')
          return { data: { user }, error: null }
        }
      }
      
      // If no user found, create a new one
      const mockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        created_at: new Date().toISOString()
      }
      
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      setUser(mockUser)
      
      toast.success('Signed in successfully!')
      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithLinkedIn = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: Date.now().toString(),
        email: 'linkedin@example.com',
        name: 'LinkedIn User',
        created_at: new Date().toISOString()
      }
      
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      setUser(mockUser)
      
      toast.success('Signed in with LinkedIn!')
      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('LinkedIn sign in error:', error)
      toast.error('Failed to sign in with LinkedIn')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('mockUser')
      setUser(null)
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const updatedUser = { ...user, ...updates }
      localStorage.setItem('mockUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast.success('Profile updated successfully!')
      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile')
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithLinkedIn,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
