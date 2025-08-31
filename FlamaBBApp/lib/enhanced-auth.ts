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
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { auth, firestore } from './firebase-config'
import { 
  authenticateWithBackend, 
  authenticateWithWallet,
  verifyBackendToken,
  getBackendUserProfile,
  updateBackendUserProfile,
  type BackendUser,
  type BackendAuthResponse
} from './backend-api'

// enhanced user profile interface
export interface EnhancedUserProfile {
  // firebase user data
  uid: string
  email: string
  displayName: string
  bio?: string
  avatar?: string
  walletAddress?: string
  cities?: string[]
  interests?: string[]
  budget?: number
  shareProfilePublicly?: boolean
  privacySettings?: boolean
  createdAt?: any
  lastLoginAt?: any
  // verification status
  verifications?: {
    zkpassport?: boolean
    talentProtocol?: boolean
    poap?: boolean
  }
  // backend user data
  backendUser?: BackendUser
  backendToken?: string
}

// enhanced authentication functions
export const enhancedSignUp = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<{ user: User | null; backendUser: BackendUser | null; error: AuthError | null }> => {
  try {
    // 1. create firebase user
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    // 2. update firebase profile
    await updateProfile(user, { displayName })

    // 3. create user document in firestore
    const userProfile: EnhancedUserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }

    await setDoc(doc(firestore, 'users', user.uid), userProfile)

    // 4. get firebase token and authenticate with backend
    const firebaseToken = await user.getIdToken()
    const backendAuth = await authenticateWithBackend(firebaseToken)

    if (backendAuth.success && backendAuth.data) {
      // 5. store backend token in firestore
      await updateDoc(doc(firestore, 'users', user.uid), {
        backendToken: backendAuth.data.token,
        backendUser: backendAuth.data.user
      })

      return { 
        user, 
        backendUser: backendAuth.data.user, 
        error: null 
      }
    } else {
      console.warn('Backend authentication failed during signup:', backendAuth.error)
      return { user, backendUser: null, error: null }
    }

  } catch (error) {
    return { user: null, backendUser: null, error: error as AuthError }
  }
}

export const enhancedSignIn = async (
  email: string, 
  password: string
): Promise<{ user: User | null; backendUser: BackendUser | null; error: AuthError | null }> => {
  try {
    // 1. sign in with firebase
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user

    // 2. update last login in firestore
    await updateDoc(doc(firestore, 'users', user.uid), {
      lastLoginAt: serverTimestamp()
    })

    // 3. get firebase token and authenticate with backend
    const firebaseToken = await user.getIdToken()
    const backendAuth = await authenticateWithBackend(firebaseToken)

    if (backendAuth.success && backendAuth.data) {
      // 4. store backend token in firestore
      await updateDoc(doc(firestore, 'users', user.uid), {
        backendToken: backendAuth.data.token,
        backendUser: backendAuth.data.user
      })

      return { 
        user, 
        backendUser: backendAuth.data.user, 
        error: null 
      }
    } else {
      console.warn('Backend authentication failed during signin:', backendAuth.error)
      return { user, backendUser: null, error: null }
    }

  } catch (error) {
    return { user: null, backendUser: null, error: error as AuthError }
  }
}

export const enhancedSignOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// enhanced user profile functions
export const getEnhancedUserProfile = async (uid: string): Promise<EnhancedUserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as EnhancedUserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting enhanced user profile:', error)
    return null
  }
}

export const updateEnhancedUserProfile = async (
  uid: string, 
  updates: Partial<EnhancedUserProfile>
): Promise<{ error: Error | null }> => {
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

// wallet authentication with backend
export const enhancedWalletAuth = async (
  walletAddress: string, 
  signature: string, 
  message: string
): Promise<{ backendUser: BackendUser | null; error: string | null }> => {
  try {
    const backendAuth = await authenticateWithWallet(walletAddress, signature, message)
    
    if (backendAuth.success && backendAuth.data) {
      return { 
        backendUser: backendAuth.data.user, 
        error: null 
      }
    } else {
      return { 
        backendUser: null, 
        error: backendAuth.error || 'authentication failed' 
      }
    }
  } catch (error) {
    console.error('Enhanced wallet auth error:', error)
    return { backendUser: null, error: 'network error' }
  }
}

// link wallet to user with backend sync
export const enhancedLinkWalletToUser = async (
  uid: string, 
  walletAddress: string
): Promise<EnhancedUserProfile | null> => {
  try {
    // 1. update firestore
    const userRef = doc(firestore, 'users', uid)
    await updateDoc(userRef, {
      walletAddress,
      updatedAt: serverTimestamp()
    })
    
    // 2. get updated profile
    const profile = await getEnhancedUserProfile(uid)
    
    // 3. if we have a backend token, update backend profile
    if (profile?.backendToken) {
      const backendUpdated = await updateBackendUserProfile(profile.backendToken, {
        walletAddress
      })
      
      if (backendUpdated) {
        // 4. refresh backend user data
        const backendUser = await getBackendUserProfile(profile.backendToken)
        if (backendUser) {
          await updateDoc(userRef, {
            backendUser
          })
        }
      }
    }
    
    return await getEnhancedUserProfile(uid)
  } catch (error) {
    console.error('Error linking wallet to user:', error)
    throw error
  }
}

// check if onboarding is complete (enhanced)
export const enhancedIsOnboardingComplete = async (uid: string): Promise<boolean> => {
  try {
    const userProfile = await getEnhancedUserProfile(uid)
    if (!userProfile) {
      console.log('❌ No user profile found for uid:', uid)
      return false
    }
    
    // check if user has completed all required onboarding steps
    const hasDisplayName = !!userProfile.displayName
    const hasWalletAddress = !!userProfile.walletAddress
    const hasCities = !!(userProfile.cities && userProfile.cities.length > 0)
    const hasInterests = !!(userProfile.interests && userProfile.interests.length > 0)
    const hasBudget = userProfile.budget !== undefined
    const hasBackendUser = !!userProfile.backendUser
    
    console.log('🔍 Enhanced onboarding completion check:', {
      hasDisplayName,
      hasWalletAddress, 
      hasCities,
      hasInterests,
      hasBudget,
      hasBackendUser,
      cities: userProfile.cities,
      interests: userProfile.interests,
      budget: userProfile.budget
    })
    
    const isComplete = hasDisplayName && hasWalletAddress && hasCities && hasInterests && hasBudget && hasBackendUser
    console.log(isComplete ? '✅ Enhanced onboarding is complete!' : '⏳ Enhanced onboarding is incomplete')
    
    return isComplete
  } catch (error) {
    console.error('Error checking enhanced onboarding status:', error)
    return false
  }
}

// auth state listener (enhanced)
export const enhancedOnAuthStateChange = (callback: (user: User | null, backendUser: BackendUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // get enhanced profile with backend user data
      const profile = await getEnhancedUserProfile(firebaseUser.uid)
      callback(firebaseUser, profile?.backendUser || null)
    } else {
      callback(null, null)
    }
  })
}
