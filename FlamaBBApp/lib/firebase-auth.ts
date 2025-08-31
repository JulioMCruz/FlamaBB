import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  AuthError,
  signInAnonymously
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
  getDocs,
  getDocFromCache,
  getDocFromServer
} from 'firebase/firestore'
import { auth, firestore } from './firebase-config'

// User profile interface
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  bio?: string
  avatar?: string
  avatarUrl?: string // Custom uploaded avatar image URL
  walletAddress?: string
  cities?: string[]
  interests?: string[]
  budget?: number
  shareProfilePublicly?: boolean
  privacySettings?: boolean
  createdAt?: any
  lastLoginAt?: any
  // Verification status
  verifications?: {
    zkpassport?: boolean
    talentProtocol?: boolean
    poap?: boolean
  }
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

// User profile functions - wallet-based authentication
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log('🔍 Getting user profile for UID:', uid)
    
    const userDoc = await getDoc(doc(firestore, 'users', uid))
    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile
      console.log('✅ Profile found:', profile)
      return profile
    }
    
    console.log('📝 No profile found for UID:', uid)
    return null
  } catch (error: any) {
    console.error('❌ Error getting user profile:', error)
    return null
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    console.log('💾 Updating user profile for UID:', uid, 'with updates:', updates)
    console.log('🔍 Bio field in updateUserProfile:', updates.bio)
    console.log('🔍 DisplayName field in updateUserProfile:', updates.displayName)
    console.log('🆔 Document path: users/' + uid)
    
    // Check if document exists first
    const userDoc = await getDoc(doc(firestore, 'users', uid))
    console.log('📄 Document exists before update:', userDoc.exists())
    
    if (userDoc.exists()) {
      // Document exists, update it
      const updateData = {
        ...updates,
        lastLoginAt: serverTimestamp()
      }
      console.log('📋 Updating existing document with:', updateData)
      await updateDoc(doc(firestore, 'users', uid), updateData)
      console.log('✅ Profile updated successfully')
    } else {
      // Document doesn't exist, create it with setDoc
      console.log('📝 Creating new profile document')
      const createData = {
        uid,
        ...updates,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }
      console.log('📋 Creating new document with:', createData)
      await setDoc(doc(firestore, 'users', uid), createData)
      console.log('✅ Profile created successfully')
    }
    
    return { error: null }
  } catch (error) {
    console.error('❌ Error updating profile:', error)
    return { error: error as Error }
  }
}

// Get profile by wallet address
export const getProfileByWallet = async (walletAddress: string): Promise<UserProfile | null> => {
  try {
    console.log('🔍 Getting profile by wallet address:', walletAddress)
    
    // Generate consistent user ID from wallet address
    const walletUserId = `wallet_${walletAddress.toLowerCase().slice(2, 12)}`
    console.log('🆔 Generated user ID:', walletUserId)
    
    // Force read from server to bypass cache
    const userDoc = await getDocFromServer(doc(firestore, 'users', walletUserId))
    console.log('📄 Document exists:', userDoc.exists())
    console.log('🌐 Reading from server (not cache)')
    
    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile
      console.log('✅ Profile found by wallet:', profile)
      console.log('📝 Bio field from Firebase:', profile.bio)
      console.log('📝 Bio field type:', typeof profile.bio)
      console.log('📋 All profile fields:', Object.keys(profile))
      return profile
    }
    
    console.log('📝 No profile found for wallet:', walletAddress)
    return null
  } catch (error: any) {
    console.error('❌ Error getting profile by wallet:', error)
    return null
  }
}

// Update profile by wallet address
export const updateProfileByWallet = async (walletAddress: string, updates: Partial<UserProfile>) => {
  try {
    console.log('💾 Updating profile by wallet address:', walletAddress, 'with updates:', updates)
    console.log('📝 Bio in updates:', updates.bio)
    console.log('📝 DisplayName in updates:', updates.displayName)
    
    // Generate consistent user ID from wallet address
    const walletUserId = `wallet_${walletAddress.toLowerCase().slice(2, 12)}`
    
    const finalUpdates = {
      ...updates,
      walletAddress // Ensure wallet address is always stored
    }
    
    console.log('📋 Final updates being sent to Firebase:', finalUpdates)
    
    return await updateUserProfile(walletUserId, finalUpdates)
  } catch (error) {
    console.error('❌ Error updating profile by wallet:', error)
    return { error: error as Error }
  }
}

export async function checkWalletExists(walletAddress: string): Promise<boolean> {
  try {
    const usersRef = collection(firestore, 'users')
    const q = query(usersRef, where('walletAddress', '==', walletAddress))
    const querySnapshot = await getDocs(q)
    
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking wallet existence:', error)
    return false
  }
}

export async function linkWalletToUser(uid: string, walletAddress: string) {
  try {
    const userRef = doc(firestore, 'users', uid)
    await updateDoc(userRef, {
      walletAddress,
      updatedAt: serverTimestamp()
    })
    
    return await getUserProfile(uid)
  } catch (error) {
    console.error('Error linking wallet to user:', error)
    throw error
  }
}

export async function isOnboardingComplete(uid: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(uid)
    if (!userProfile) {
      console.log('❌ No user profile found for uid:', uid)
      return false
    }
    
    // Check if user has completed all required onboarding steps
    const hasDisplayName = !!userProfile.displayName
    const hasWalletAddress = !!userProfile.walletAddress
    const hasCities = !!(userProfile.cities && userProfile.cities.length > 0)
    const hasInterests = !!(userProfile.interests && userProfile.interests.length > 0)
    const hasBudget = userProfile.budget !== undefined
    
    console.log('🔍 Onboarding completion check:', {
      hasDisplayName,
      hasWalletAddress, 
      hasCities,
      hasInterests,
      hasBudget,
      cities: userProfile.cities,
      interests: userProfile.interests,
      budget: userProfile.budget
    })
    
    const isComplete = hasDisplayName && hasWalletAddress && hasCities && hasInterests && hasBudget
    console.log(isComplete ? '✅ Onboarding is complete!' : '⏳ Onboarding is incomplete')
    
    return isComplete
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * TEMPORARY: Create a mock user for testing CDP wallet functionality
 * This bypasses Firebase Authentication until it's properly configured
 */
export async function createAnonymousUserWithWallet(walletAddress: string, displayName?: string) {
  try {
    console.log('🔐 Creating wallet-based user profile:', walletAddress)
    
    // Generate consistent user ID from wallet address
    const walletUserId = `wallet_${walletAddress.toLowerCase().slice(2, 12)}`
    
    // Check if user profile already exists
    try {
      const existingUserDoc = await getDoc(doc(firestore, 'users', walletUserId))
      
      if (existingUserDoc.exists()) {
        console.log('👤 User profile already exists')
        const existingUserData = existingUserDoc.data() as UserProfile
        
        // Create mock user object for compatibility
        const mockUser = {
          uid: walletUserId,
          email: existingUserData.email,
          displayName: existingUserData.displayName,
          isAnonymous: true,
          emailVerified: false
        } as any
        
        return { user: mockUser, profile: existingUserData }
      }
    } catch (error) {
      console.log('📝 No existing profile found, creating new one')
    }
    
    console.log('📝 Creating new wallet-based user profile')
    
    // Create user profile using wallet address as authentication
    const initialProfile: UserProfile = {
      uid: walletUserId,
      email: `${walletAddress.toLowerCase()}@wallet.flamabb.local`,
      displayName: displayName || `Anonymous ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      walletAddress: walletAddress,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }
    
    // Save to Firestore (rules allow all operations for development)
    await setDoc(doc(firestore, 'users', walletUserId), initialProfile)
    
    console.log('✅ Wallet-based user profile created successfully')
    
    // Create mock user object for compatibility
    const mockUser = {
      uid: walletUserId,
      email: initialProfile.email,
      displayName: initialProfile.displayName,
      isAnonymous: true,
      emailVerified: false
    } as any
    
    return { user: mockUser, profile: initialProfile }
    
  } catch (error) {
    console.error('❌ Error creating wallet-based user:', error)
    throw error
  }
}

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}