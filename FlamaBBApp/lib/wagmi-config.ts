import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia, mainnet } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'FlamaBB - Buenos Aires Experiences',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9a7b9b9b9b9b9b9b9b9b9b9b9b9b9b9b',
  chains: [
    baseSepolia, // Default testnet for app functionality
    base,        // Base mainnet for future production
    mainnet,     // Ethereum mainnet for ENS resolution
  ],
  ssr: true,
})