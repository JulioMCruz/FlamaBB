"use client"

import { sdk } from '@farcaster/miniapp-sdk'

/**
 * Farcaster SDK Integration Utilities
 * Official integration with @farcaster/miniapp-sdk
 */

/**
 * Call the official Farcaster ready function 
 * This dismisses the splash screen properly
 */
export async function callFarcasterReady() {
  console.log('🚀 callFarcasterReady: Using official Farcaster SDK')
  
  if (typeof window === 'undefined') {
    console.log('❌ Server side, skipping ready call')
    return
  }

  try {
    // Official Farcaster SDK ready call (MUST be async)
    console.log('✅ Calling await sdk.actions.ready()')
    await sdk.actions.ready()
    
    console.log('✅ Farcaster ready call successful - splash screen should dismiss')

  } catch (error) {
    console.error('❌ Error calling official SDK ready:', error)
    
    // Fallback to manual postMessage if SDK fails
    try {
      if (window.parent && window.parent !== window) {
        console.log('📤 Fallback: PostMessage to parent frame')
        window.parent.postMessage({
          type: 'frame_ready',
          ready: true,
          timestamp: Date.now()
        }, '*')
      }
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError)
    }
  }
}

/**
 * Initialize Farcaster SDK using official methods
 */
export async function initializeFarcasterSDK() {
  console.log('🚀 Initializing official Farcaster SDK')
  
  try {
    // Call ready immediately - the official SDK handles timing
    await callFarcasterReady()
  } catch (error) {
    console.error('❌ Initial ready call failed:', error)
  }
  
  // Additional retry for reliability
  setTimeout(async () => {
    console.log('🔄 Additional ready call after 1s')
    try {
      await callFarcasterReady()
    } catch (error) {
      console.error('❌ Retry ready call failed:', error)
    }
  }, 1000)
}

/**
 * Check if we're running in a Farcaster environment 
 */
export function isFarcasterFrame(): boolean {
  if (typeof window === 'undefined') return false
  
  // Use official SDK context check
  try {
    return sdk.context.client.name === 'farcaster'
  } catch {
    // Fallback detection methods
    const inFrame = window !== window.parent || window !== window.top
    const url = window.location.href
    const urlIndicators = url.includes('ngrok.io') || url.includes('farcaster') || url.includes('miniapp')
    const referrer = document.referrer
    const referrerIndicators = referrer.includes('farcaster') || referrer.includes('warpcast')
    
    return inFrame || urlIndicators || referrerIndicators
  }
}

/**
 * Get Farcaster user context
 */
export async function getFarcasterUser() {
  try {
    return await sdk.context.user
  } catch (error) {
    console.error('Failed to get Farcaster user:', error)
    return null
  }
}