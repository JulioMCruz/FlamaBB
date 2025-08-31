'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/wagmi-config'
import { WalletHeader } from '@/components/wallet-header'
import { AuthProvider } from '@/contexts/auth-context'
import { FarcasterWebProviders, FarcasterMobileProviders } from '@/components/providers/farcaster-providers'
import { detectEnvironment, logEnvironmentInfo, type AppEnvironment } from '@/lib/environment-detection'

const queryClient = new QueryClient()

/**
 * Browser Environment Provider Stack (Default)
 * Full RainbowKit + wagmi setup for web browsers
 */
function BrowserProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <WalletHeader />
            <div style={{ paddingTop: '60px' }}>
              {children}
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthProvider>
  )
}

/**
 * Multi-Environment Provider System
 * Detects environment and loads appropriate provider stack
 */
export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [environment, setEnvironment] = useState<AppEnvironment>('browser')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Detect environment on client-side only
    const env = detectEnvironment()
    setEnvironment(env)
    setIsLoading(false)
    
    // Log environment info for debugging
    logEnvironmentInfo()
    
    console.log('🚀 Multi-Environment Provider System Active')
    console.log(`📱 Environment: ${env}`)
  }, [])

  // Loading state while detecting environment
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Detecting environment...</p>
        </div>
      </div>
    )
  }

  // Route to appropriate provider stack based on detected environment
  switch (environment) {
    case 'farcaster-web':
      console.log('🎯 Loading Farcaster Web Providers')
      return (
        <FarcasterWebProviders>
          {children}
        </FarcasterWebProviders>
      )

    case 'farcaster-mobile':
      console.log('📱 Loading Farcaster Mobile Providers')
      return (
        <FarcasterMobileProviders>
          {children}
        </FarcasterMobileProviders>
      )

    case 'browser':
    default:
      console.log('🌐 Loading Browser Providers (RainbowKit)')
      return (
        <BrowserProviders>
          {children}
        </BrowserProviders>
      )
  }
}