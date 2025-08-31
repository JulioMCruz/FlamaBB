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

  // get user profile from backend api
  static async getUserProfile(walletAddress: string) {
    try {
      // for now, return null to trigger onboarding
      // proper authentication will happen when user completes onboarding
      console.log('User profile check - returning null to trigger onboarding')
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
      
      // for now, always return false to trigger onboarding
      // this will be updated when we implement proper profile checking
      return false
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
