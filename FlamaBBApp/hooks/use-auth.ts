'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, getUserProfile, UserProfile } from '@/lib/firebase-auth'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)
      
      if (user) {
        // Fetch user profile from Firestore
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/firebase-auth')
    await signOut()
    setUser(null)
    setProfile(null)
  }

  return {
    user,
    profile,
    loading,
    signOut: handleSignOut
  }
}

export { AuthContext }