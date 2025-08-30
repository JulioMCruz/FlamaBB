import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  AuthError
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { auth, firestore } from './firebase-config'

// User profile interface
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  bio?: string
  avatar?: string
  walletAddress?: string
  cities?: string[]
  interests?: string[]
  budget?: number
  createdAt?: any
  lastLoginAt?: any
}

// Authentication functions
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Update user profile
    await updateProfile(user, { displayName })

    // Create user document in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }

    await setDoc(doc(firestore, 'users', user.uid), userProfile)

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error as AuthError }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    
    // Update last login
    await updateDoc(doc(firestore, 'users', result.user.uid), {
      lastLoginAt: serverTimestamp()
    })

    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: error as AuthError }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// User profile functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(firestore, 'users', uid), {
      ...updates,
      lastLoginAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}