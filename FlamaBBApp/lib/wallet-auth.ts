import { useAccount, useSignMessage } from 'wagmi'
import { authenticateWithWallet, getBackendUserProfile, updateBackendUserProfile } from './backend-api'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { firestore } from './firebase-config'

// wallet authentication service
export class WalletAuthService {
  // authenticate user with wallet signature
  static async authenticateWithWalletSignature(
    walletAddress: string,
    signature: string,
    message: string
  ) {
    try {
      const result = await authenticateWithWallet(walletAddress, signature, message)
      
      if (result.success && result.data) {
        return {
          success: true,
          backendUser: result.data.user,
          token: result.data.token
        }
      } else {
        return {
          success: false,
          error: result.error || 'authentication failed'
        }
      }
    } catch (error) {
      console.error('Wallet authentication error:', error)
      return {
        success: false,
        error: 'network error'
      }
    }
  }

  // create or update user profile in firestore with backend data
  static async syncUserWithBackend(
    walletAddress: string,
    backendUser: any,
    backendToken: string
  ) {
    try {
      const userRef = doc(firestore, 'users', walletAddress)
      
      // check if user exists
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        // update existing user
        await updateDoc(userRef, {
          walletAddress,
          backendUser,
          backendToken,
          lastLoginAt: serverTimestamp()
        })
      } else {
        // create new user
        await setDoc(userRef, {
          uid: walletAddress,
          walletAddress,
          displayName: `User ${walletAddress.slice(0, 6)}...`,
          backendUser,
          backendToken,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error syncing user with backend:', error)
      return { success: false, error }
    }
  }

  // get user profile from firestore
  static async getUserProfile(walletAddress: string) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', walletAddress))
      
      if (userDoc.exists()) {
        return userDoc.data()
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // check if user is onboarded
  static async isUserOnboarded(walletAddress: string) {
    try {
      const profile = await this.getUserProfile(walletAddress)
      
      if (!profile) return false
      
      // check if user has completed onboarding
      const hasBackendUser = !!profile.backendUser
      const hasCities = !!(profile.cities && profile.cities.length > 0)
      const hasInterests = !!(profile.interests && profile.interests.length > 0)
      const hasBudget = profile.budget !== undefined
      
      return hasBackendUser && hasCities && hasInterests && hasBudget
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      return false
    }
  }
}

// react hook for wallet authentication
export function useWalletAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const authenticateWallet = async () => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      // create message to sign
      const message = `Sign this message to authenticate with FlamaBB: ${address}`
      
      // sign message
      const signature = await signMessageAsync({ message })
      
      // authenticate with backend
      const authResult = await WalletAuthService.authenticateWithWalletSignature(
        address,
        signature,
        message
      )
      
      if (authResult.success && authResult.backendUser) {
        // sync user data with firestore
        await WalletAuthService.syncUserWithBackend(
          address,
          authResult.backendUser,
          authResult.token
        )
        
        return {
          success: true,
          backendUser: authResult.backendUser,
          token: authResult.token
        }
      } else {
        return {
          success: false,
          error: authResult.error
        }
      }
    } catch (error) {
      console.error('Wallet authentication error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'authentication failed'
      }
    }
  }

  return {
    authenticateWallet,
    address,
    isConnected
  }
}
