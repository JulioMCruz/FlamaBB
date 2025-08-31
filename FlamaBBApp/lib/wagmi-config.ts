import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia, mainnet } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

export const wagmiConfig = getDefaultConfig({
  appName: 'FlamaBB - Buenos Aires Experiences',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9a7b9b9b9b9b9b9b9b9b9b9b9b9b9b9b',
  chains: [
    baseSepolia, // Default testnet for app functionality
    base,        // Base mainnet for future production
    mainnet,     // Ethereum mainnet for ENS resolution
  ],
  connectors: [
    coinbaseWallet({
      appName: 'FlamaBB - Buenos Aires Experiences',
      appLogoUrl: 'https://flamabb.vercel.app/flamabb-mascot.png',
      preference: 'all', // Support both EOA and Smart Wallet
    }),
  ],
  ssr: true,
})