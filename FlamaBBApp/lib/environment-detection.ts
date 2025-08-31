"use client"

// Environment detection utilities for FlamaBB Multi-Platform support
// Supports: Web Browser, Farcaster Web Client, Farcaster Mobile App

export type AppEnvironment = 'browser' | 'farcaster-web' | 'farcaster-mobile'

/**
 * Detect the current application environment
 * Returns the environment type for proper provider and wallet configuration
 */
export function detectEnvironment(): AppEnvironment {
  // Server-side rendering - default to browser
  if (typeof window === 'undefined') {
    return 'browser'
  }

  // Check for Farcaster SDK availability (indicates Farcaster environment)
  const hasFarcasterSDK = !!(window as any).farcaster || !!(window as any).sdk || !!(window as any).minikit
  const hasReadyFunction = typeof (window as any).ready === 'function'
  
  if (hasFarcasterSDK || hasReadyFunction) {
    console.log('🎯 Farcaster environment detected', {
      farcaster: !!(window as any).farcaster,
      sdk: !!(window as any).sdk,
      minikit: !!(window as any).minikit,
      ready: hasReadyFunction
    })
    
    // Check if mobile based on user agent and viewport
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768

    return isMobile ? 'farcaster-mobile' : 'farcaster-web'
  }

  // Check user agent for Farcaster-specific strings
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('farcaster') || userAgent.includes('miniapp')) {
      console.log('🎯 Farcaster user agent detected')
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
      return isMobile ? 'farcaster-mobile' : 'farcaster-web'
    }
  }

  // Check for ngrok domain (development setup)
  if (typeof window !== 'undefined' && window.location?.hostname?.includes('ngrok.io')) {
    console.log('🔧 Development ngrok domain detected - assuming Farcaster environment')
    const isMobile = window.innerWidth < 768
    return isMobile ? 'farcaster-mobile' : 'farcaster-web'
  }

  // Default to browser environment
  console.log('🌐 Browser environment detected (default)')
  return 'browser'
}

/**
 * Check if running in any Farcaster environment
 */
export function isFarcasterEnvironment(): boolean {
  const env = detectEnvironment()
  return env === 'farcaster-web' || env === 'farcaster-mobile'
}

/**
 * Check if running in browser environment
 */
export function isBrowserEnvironment(): boolean {
  return detectEnvironment() === 'browser'
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(environment: AppEnvironment) {
  const baseConfig = {
    appName: 'FlamaBB - Buenos Aires Experiences',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  }

  switch (environment) {
    case 'browser':
      return {
        ...baseConfig,
        providersNeeded: ['wagmi', 'rainbowkit', 'auth'],
        walletSupport: 'full', // All wallet types supported
        features: ['wallet-connect', 'manual-network-switch', 'full-ui']
      }
      
    case 'farcaster-web':
      return {
        ...baseConfig,
        providersNeeded: ['wagmi', 'minikit', 'auth'],
        walletSupport: 'farcaster-native', // Farcaster wallet integration
        features: ['farcaster-auth', 'embedded-wallet', 'frame-integration']
      }
      
    case 'farcaster-mobile':
      return {
        ...baseConfig,
        providersNeeded: ['wagmi', 'minikit', 'auth'],
        walletSupport: 'farcaster-native', // Mobile Farcaster wallet
        features: ['mobile-optimized', 'farcaster-auth', 'native-ui']
      }
      
    default:
      return baseConfig
  }
}

/**
 * Environment-specific logging
 */
export function logEnvironmentInfo() {
  const env = detectEnvironment()
  const config = getEnvironmentConfig(env)
  
  console.log('🎯 Environment Detection Results:')
  console.log('📱 Environment:', env)
  console.log('⚙️ Configuration:', config)
  console.log('🔗 User Agent:', navigator?.userAgent || 'N/A')
  console.log('📏 Viewport:', `${window?.innerWidth || 0}x${window?.innerHeight || 0}`)
  console.log('🪟 Window objects:', {
    farcaster: !!(window as any)?.farcaster,
    minikit: !!(window as any)?.minikit,
    ethereum: !!(window as any)?.ethereum
  })
}