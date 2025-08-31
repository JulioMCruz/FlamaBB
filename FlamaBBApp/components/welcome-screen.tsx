"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Dashboard } from "@/components/dashboard"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useAuth } from "@/contexts/auth-context"
import { useWalletAuth, WalletAuthService } from "@/lib/wallet-auth"

export function WelcomeScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const { isConnected, address } = useAccount()
  const { authenticateWallet } = useWalletAuth()

  // Handle wallet connection and authentication
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address && !showOnboarding && !showDashboard) {
        try {
          setCheckingOnboarding(true)
          
          // Check if user is already onboarded
          const onboardingCompleted = await WalletAuthService.isUserOnboarded(address)
          
          if (onboardingCompleted) {
            // User has completed onboarding, go straight to dashboard
            setShowDashboard(true)
          } else {
            // User needs to complete onboarding, go directly to onboarding flow
            setShowOnboarding(true)
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error)
          // If there's an error, default to showing onboarding
          setShowOnboarding(true)
        } finally {
          setCheckingOnboarding(false)
        }
      }
    }

    handleWalletConnection()
  }, [isConnected, address, showOnboarding, showDashboard])

  if (showDashboard) {
    return <Dashboard />
  }

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img src="/flamabb-mascot.png" alt="FlamaBB Mascot" className="w-48 h-48 rounded-full" />
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Flama<span className="text-blue-500">BB</span>
            </h1>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-balance">Welcome to FlamaBB</h2>
            <p className="text-gray-600 text-balance leading-relaxed">
              Unlock curated local experiences powered by the community and Web3
            </p>
          </div>

          {/* Connect Wallet Button */}
          <Button
            onClick={async () => {
              if (isConnected && address) {
                // Wallet is connected, authenticate with backend
                setAuthenticating(true)
                try {
                  const result = await authenticateWallet()
                  if (result.success) {
                    console.log('✅ Wallet authenticated with backend!')
                    // Go directly to onboarding for new users
                    setShowOnboarding(true)
                  } else {
                    console.error('❌ Wallet authentication failed:', result.error)
                    // Still show onboarding even if backend auth fails
                    setShowOnboarding(true)
                  }
                } catch (error) {
                  console.error('❌ Wallet authentication error:', error)
                  // Still show onboarding even if backend auth fails
                  setShowOnboarding(true)
                } finally {
                  setAuthenticating(false)
                }
              } else {
                // Wallet not connected, just show onboarding
                setShowOnboarding(true)
              }
            }}
            disabled={authenticating || checkingOnboarding}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {authenticating || checkingOnboarding ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>{checkingOnboarding ? 'Checking...' : 'Authenticating...'}</span>
              </div>
            ) : (
              'Connect Wallet'
            )}
          </Button>

          {/* Learn more link */}
          <div className="text-center mt-6">
            <button className="text-gray-600 underline text-sm hover:text-gray-800 transition-colors">
              Learn more about FlamaBB
            </button>
          </div>


        </div>

        {/* Step indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
        </div>

        <div className="text-center mt-4">
          <span className="text-white/80 text-sm">Step 1 of 5</span>
        </div>
      </div>
    </div>
  )
}
