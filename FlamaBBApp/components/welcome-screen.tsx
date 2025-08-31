"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Dashboard } from "@/components/dashboard"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useAuth } from "@/contexts/auth-context"
import { useWalletAuth, WalletAuthService } from "@/lib/wallet-auth"
import { cdpWalletService } from "@/lib/cdp-wallet-service"

export function WelcomeScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [testingWallet, setTestingWallet] = useState(false)
  const [walletTestResult, setWalletTestResult] = useState<string | null>(null)
  const { isConnected, address } = useAccount()
  const { authenticateWallet } = useWalletAuth()
  
  // debug logging
  console.log('🔍 WelcomeScreen state:', { isConnected, address, showOnboarding, showDashboard })

  // Handle wallet connection and authentication
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address && !showOnboarding && !showDashboard) {
        console.log('🔗 Wallet connected, checking onboarding status...')
        try {
          setCheckingOnboarding(true)
          
          // Check if user is already onboarded
          const onboardingCompleted = await WalletAuthService.isUserOnboarded(address)
          
          if (onboardingCompleted) {
            // User has completed onboarding, go straight to dashboard
            console.log('✅ User already onboarded, going to dashboard')
            setShowDashboard(true)
          } else {
            // User needs to complete onboarding, go directly to onboarding flow
            console.log('📝 User needs onboarding, going to onboarding flow')
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

  // Test CDP wallet creation directly
  const testCDPWalletCreation = async () => {
    if (!address) {
      setWalletTestResult("❌ Please connect your wallet first")
      return
    }

    setTestingWallet(true)
    setWalletTestResult("🔄 Testing CDP wallet creation...")

    try {
      console.log('🧪 Testing CDP wallet creation...')
      
      const testExperienceId = `test_${Date.now()}`
      const testTitle = `Test Experience ${Date.now()}`
      
      const wallet = await cdpWalletService.createExperienceWallet(
        testExperienceId,
        testTitle
      )

      if (wallet && wallet.accountAddress) {
        setWalletTestResult(`✅ SUCCESS! CDP Wallet Created: ${wallet.accountAddress.slice(0, 10)}...${wallet.accountAddress.slice(-8)}`)
        console.log('🎉 CDP wallet test successful:', wallet)
      } else {
        setWalletTestResult("❌ Failed to create CDP wallet")
      }
    } catch (error) {
      console.error('❌ CDP wallet test failed:', error)
      setWalletTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestingWallet(false)
    }
  }

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

          {/* Welcome message when wallet is connected */}
          {isConnected && (
            <div className="text-center mb-8">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">Wallet Connected</span>
                </div>
                <p className="text-green-600 text-sm">
                  Welcome back! Your wallet is connected and ready to use.
                </p>
              </div>
            </div>
          )}

          {/* Get Started Button */}
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
                // Wallet not connected, show message to connect first
                console.log('Please connect your wallet first using the button in the header')
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
              isConnected ? 'Get Started' : 'Connect Wallet to Continue'
            )}
          </Button>

          {/* CDP Wallet Test Button (Development Only) */}
          {isConnected && process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <Button
                onClick={testCDPWalletCreation}
                disabled={testingWallet}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {testingWallet ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Testing CDP Wallet...
                  </div>
                ) : (
                  '🧪 Test CDP Wallet Creation'
                )}
              </Button>
              
              {walletTestResult && (
                <div className="mt-3 p-3 bg-white/10 rounded-xl">
                  <p className="text-sm text-white text-center font-mono">
                    {walletTestResult}
                  </p>
                </div>
              )}
            </div>
          )}

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
