"use client"

import { PropsWithChildren, useEffect } from "react"
import { MiniKitProvider as OnchainKitMiniKitProvider } from '@coinbase/onchainkit/minikit'
import { base, baseSepolia } from 'wagmi/chains'
import { FarcasterWalletHeader } from "@/components/wallet-header-farcaster"
import { callFarcasterReady } from "@/lib/farcaster-sdk"

/**
 * MiniKit Provider for Farcaster Mini Apps
 * Official integration with @coinbase/onchainkit
 */
export function MiniKitProvider({ children }: PropsWithChildren) {
  return (
    <OnchainKitMiniKitProvider 
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY || 'test-key'}
      chain={baseSepolia}
    >
      <MiniKitFrameReady>
        <div className="minikit-app-container">
          <FarcasterWalletHeader />
          <div style={{ paddingTop: '60px' }}>
            {children}
          </div>
        </div>
      </MiniKitFrameReady>
    </OnchainKitMiniKitProvider>
  )
}

/**
 * MiniKit Frame Ready Component
 * NOTE: Ready call moved to FarcasterReadySignal for proper timing
 */
export function MiniKitFrameReady({ children }: PropsWithChildren) {
  useEffect(() => {
    console.log('📱 MiniKitFrameReady: Provider initialized (ready call handled by FarcasterReadySignal)')
  }, [])

  return <>{children}</>
}