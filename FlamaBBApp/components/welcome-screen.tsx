"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { AgeVerification } from "@/components/age-verification"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

export function WelcomeScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const { isConnected } = useAccount()

  // Automatically proceed to age verification when wallet is connected
  useEffect(() => {
    if (isConnected && !showAgeVerification && !showOnboarding) {
      setShowAgeVerification(true)
    }
  }, [isConnected, showAgeVerification, showOnboarding])

  // Handle age verification completion
  const handleAgeVerified = () => {
    setShowAgeVerification(false)
    setShowOnboarding(true)
  }

  // Handle going back from age verification
  const handleBackFromAgeVerification = () => {
    setShowAgeVerification(false)
  }

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  if (showAgeVerification) {
    return (
      <AgeVerification 
        onVerified={handleAgeVerified}
        onBack={handleBackFromAgeVerification}
      />
    )
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

          {/* RainbowKit Connect Button */}
          {/* <div className="[&>*]:w-full">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading'
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated')

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                          >
                            Connect Wallet
                          </Button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
                          >
                            Wrong network
                          </Button>
                        )
                      }

                      return (
                        <Button
                          onClick={openAccountModal}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
                        >
                          {account.displayName}
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ''}
                        </Button>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div> */}

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
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
        </div>

        <div className="text-center mt-4">
          <span className="text-white/80 text-sm">Step 1 of 6</span>
        </div>
      </div>
    </div>
  )
}
