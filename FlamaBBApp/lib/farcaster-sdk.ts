"use client"

import { sdk } from '@farcaster/miniapp-sdk'

/**
 * Farcaster SDK Integration Utilities
 * Official integration with @farcaster/miniapp-sdk
 */

/**
 * Call the official Farcaster ready function 
 * Enhanced for production environments with robust error handling
 */
export async function callFarcasterReady() {
  console.log('🚀 callFarcasterReady: Using official Farcaster SDK (production-ready)')
  
  if (typeof window === 'undefined') {
    console.log('❌ Server side, skipping ready call')
    return
  }

  // Wait a moment for any pending rendering (critical for production)
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    // Check SDK availability before calling
    if (typeof sdk === 'undefined') {
      throw new Error('Farcaster SDK not available')
    }

    // Official Farcaster SDK ready call (MUST be async)
    console.log('✅ Calling await sdk.actions.ready() - production environment')
    await sdk.actions.ready()
    
    console.log('✅ Production ready call successful - splash screen dismissed')
    
    // Set success flag
    ;(window as any).__farcaster_ready_success = true

  } catch (error) {
    console.error('❌ Error calling official SDK ready:', error)
    console.log('🔄 Attempting comprehensive fallback methods')
    
    // Enhanced fallback methods for production reliability
    const fallbackMethods = [
      // Method 1: Direct window SDK call
      () => {
        if ((window as any).sdk?.actions?.ready) {
          console.log('🔧 Fallback 1: Direct window.sdk.actions.ready()')
          ;(window as any).sdk.actions.ready()
          return true
        }
        return false
      },
      
      // Method 2: PostMessage to parent
      () => {
        if (window.parent && window.parent !== window) {
          console.log('🔧 Fallback 2: PostMessage to parent frame')
          window.parent.postMessage({
            type: 'frame_ready',
            ready: true,
            timestamp: Date.now(),
            source: 'flamabb-production'
          }, '*')
          return true
        }
        return false
      },
      
      // Method 3: Custom ready event
      () => {
        console.log('🔧 Fallback 3: Custom ready event dispatch')
        const readyEvent = new CustomEvent('farcaster-ready', {
          detail: { ready: true, timestamp: Date.now() }
        })
        window.dispatchEvent(readyEvent)
        if (window.parent) {
          window.parent.postMessage({ type: 'farcaster-ready', ready: true }, '*')
        }
        return true
      }
    ]

    // Try each fallback method
    for (const method of fallbackMethods) {
      try {
        if (method()) {
          console.log('✅ Fallback method successful')
          break
        }
      } catch (fallbackError) {
        console.warn('⚠️ Fallback method failed:', fallbackError)
      }
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