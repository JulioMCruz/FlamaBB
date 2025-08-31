"use client"

import React, { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { usePathname } from "next/navigation"
import { farcasterUtils } from "@/components/providers/farcaster-providers"
import { detectEnvironment, isFarcasterEnvironment } from "@/lib/environment-detection"

export function FarcasterWalletHeader() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const pathname = usePathname()
  const [farcasterUser, setFarcasterUser] = useState<any>(null)
  
  const environment = detectEnvironment()
  const isFarcaster = isFarcasterEnvironment()
  
  // Get Farcaster user info if available
  React.useEffect(() => {
    if (isFarcaster && farcasterUtils.isAvailable()) {
      farcasterUtils.getUserInfo().then(setFarcasterUser)
    }
  }, [isFarcaster])

  const handleConnect = async () => {
    // Try to connect via Farcaster injected provider first
    const farcasterConnector = connectors.find(connector => 
      connector.id === 'io.farcaster' || connector.name?.toLowerCase().includes('farcaster')
    )
    
    if (farcasterConnector) {
      connect({ connector: farcasterConnector })
    } else {
      // Fallback to first available injected connector
      const injectedConnector = connectors.find(connector => 
        connector.type === 'injected'
      )
      if (injectedConnector) {
        connect({ connector: injectedConnector })
      }
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  console.log('🎯 FarcasterWalletHeader state:', { 
    isConnected, 
    address, 
    environment,
    farcasterUser,
    pathname 
  })

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-2">
          <img src="/flamabb-mascot.png" alt="FlamaBB" className="w-6 h-6" />
          <span className="text-sm font-semibold text-gray-800">FlamaBB</span>
          {/* Farcaster environment indicator */}
          {/* <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {environment === 'farcaster-web' ? '🎯 Farcaster Web' : '📱 Farcaster Mobile'}
          </div> */}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection status */}
          {isConnected && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
          )}

          {/* Farcaster user info if available */}
          {farcasterUser && (
            <div className="flex items-center space-x-2 text-xs text-purple-600">
              <span>👤 {farcasterUser.username || farcasterUser.displayName}</span>
            </div>
          )}
          
          {/* Wallet connection controls */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-gray-600">
                  {formatAddress(address || '')}
                </span>
                {/* <button
                  onClick={() => disconnect()}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                >
                  Disconnect
                </button> */}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Connect Farcaster Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}