import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'FlamaBB - Buenos Aires Experiences',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9a7b9b9b9b9b9b9b9b9b9b9b9b9b9b9b',
  chains: [
    base,
    baseSepolia,
  ],
  ssr: true,
})