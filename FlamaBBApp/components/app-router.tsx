"use client"

import { useAuth } from "@/contexts/auth-context"
import { WelcomeScreen } from "@/components/welcome-screen"
import { Dashboard } from "@/components/dashboard"
import { WalletDisconnected } from "@/components/wallet-disconnected"
import { useAccount } from "wagmi"

export function AppRouter() {
  const { user, loading, isOnboarded } = useAuth()
  const { isConnected } = useAccount()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    )
  }

  // Wallet disconnected → show blank page with logo
  if (!isConnected) {
    return <WalletDisconnected />
  }

  // Not logged in or not onboarded → show welcome/wizard flow
  if (!user || !isOnboarded) {
    return <WelcomeScreen />
  }

  // User is logged in and onboarded → show dashboard
  return <Dashboard />
}