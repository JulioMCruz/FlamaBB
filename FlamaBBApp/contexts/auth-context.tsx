"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { auth } from "@/lib/firebase-config"
import { onAuthStateChanged } from "firebase/auth"
import { getUserProfile, type UserProfile } from "@/lib/firebase-auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  hasWallet: boolean
  isOnboarded: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  hasWallet: false,
  isOnboarded: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          // Check if user profile exists in Firebase DB
          const profile = await getUserProfile(firebaseUser.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const hasWallet = userProfile?.walletAddress ? true : false
  const isOnboarded = userProfile && hasWallet && userProfile.cities && userProfile.interests

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        hasWallet,
        isOnboarded: !!isOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}