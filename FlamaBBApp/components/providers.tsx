'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/wagmi-config'
import { WalletHeader } from '@/components/wallet-header'
import { AuthProvider } from '@/contexts/auth-context'

const queryClient = new QueryClient()

export function Web3Providers({ children }: { children: React.ReactNode }) {
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