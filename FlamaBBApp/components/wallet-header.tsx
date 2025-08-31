"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { usePathname } from "next/navigation"

export function WalletHeader() {
  const { isConnected } = useAccount()
  const pathname = usePathname()
  
  // show connect button on welcome screen only when wallet is not connected
  const isWelcomeScreen = pathname === "/"
  
  console.log('🔍 WalletHeader state:', { isConnected, pathname, isWelcomeScreen })

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-2">
          <img src="/flamabb-mascot.png" alt="FlamaBB" className="w-6 h-6" />
          <span className="text-sm font-semibold text-gray-800">FlamaBB</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {isConnected && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
          )}
          
          {/* Always show ConnectButton - it handles both connect and disconnect */}
          <div className="scale-90 [&>*]:rounded-xl">
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>
    </div>
  )
}