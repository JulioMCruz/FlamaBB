# Farcaster Mini App Integration Setup Guide

## 🎯 Overview

FlamaBBApp now supports 3 environments:
1. **Web Browser** - Full RainbowKit + Wagmi setup (current implementation)
2. **Farcaster Web Client** - Mini App with frame integration
3. **Farcaster Mobile** - Mobile-optimized Mini App

## 🚀 Quick Start

The multi-environment system is **already implemented** with placeholder components. To activate full Farcaster integration:

```bash
# Install required dependencies
npm install @coinbase/onchainkit @farcaster/miniapp-wagmi-connector

# Add environment variables
NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_coinbase_api_key
```

## 📦 Required Dependencies

### Core Farcaster Integration
```bash
npm install @coinbase/onchainkit         # MiniKit provider and hooks
npm install @farcaster/miniapp-wagmi-connector  # Wagmi connector for Farcaster
```

### Environment Variables
Add to `.env.local`:
```bash
# Coinbase Developer Platform API Key (for MiniKit)
NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_coinbase_api_key

# Existing Base network configuration (already configured)
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

## 🏗️ Architecture Overview

### Current Implementation Status
- ✅ **Environment Detection** - Automatic detection of browser vs Farcaster environments
- ✅ **Provider Architecture** - Conditional loading of appropriate providers
- ✅ **Wagmi Configuration** - Farcaster-specific wagmi setup with Base chain priority
- ✅ **UI Components** - Farcaster-specific wallet header and connection flow
- 🔄 **Placeholder Components** - Ready for actual MiniKit integration

### Provider Hierarchy

**Browser Environment (Current - No Changes):**
```
AuthProvider → WagmiProvider → QueryClientProvider → RainbowKitProvider → App
```

**Farcaster Environments (New):**
```
AuthProvider → WagmiProvider → QueryClientProvider → MiniKitProvider → MiniKitFrameReady → App
```

### File Structure
```
components/
├── providers.tsx                    # Multi-environment provider routing
├── providers/
│   ├── farcaster-providers.tsx     # Farcaster-specific providers
│   └── minikit-provider.tsx        # MiniKit integration wrapper
├── wallet-header.tsx               # Browser wallet header (existing)
└── wallet-header-farcaster.tsx     # Farcaster wallet header (new)
lib/
└── environment-detection.ts        # Environment detection utilities
```

## 🔧 Implementation Steps

### Step 1: Install Dependencies (Required)
```bash
cd FlamaBBApp
npm install @coinbase/onchainkit @farcaster/miniapp-wagmi-connector
```

### Step 2: Add API Key
Get Coinbase Developer Platform API key and add to `.env.local`:
```bash
NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_actual_api_key_here
```

### Step 3: Update MiniKit Provider (Replace Placeholder)
Replace content in `components/providers/minikit-provider.tsx`:

```typescript
"use client"

import { PropsWithChildren, useEffect } from "react"
import { MiniKitProvider as OnchainKitMiniKitProvider, useMiniKit as useOnchainKitMiniKit } from '@coinbase/onchainkit/minikit'
import { base } from 'wagmi/chains'
import { FarcasterWalletHeader } from "@/components/wallet-header-farcaster"

export function MiniKitProvider({ children }: PropsWithChildren) {
  return (
    <OnchainKitMiniKitProvider 
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY!} 
      chain={base}
    >
      <div className="minikit-app-container">
        <FarcasterWalletHeader />
        <div style={{ paddingTop: '60px' }}>
          {children}
        </div>
      </div>
    </OnchainKitMiniKitProvider>
  )
}

export const useMiniKit = useOnchainKitMiniKit

export function MiniKitFrameReady({ children }: PropsWithChildren) {
  const { setFrameReady, isFrameReady } = useMiniKit()

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])

  return <>{children}</>
}
```

### Step 4: Update Farcaster Wagmi Configuration
Replace connector configuration in `components/providers/farcaster-providers.tsx`:

```typescript
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

const farcasterWagmiConfig = createConfig({
  chains: [base, baseSepolia, mainnet],
  connectors: [
    farcasterMiniApp(), // Official Farcaster Mini App connector
    injected(), // Fallback
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
    [mainnet.id]: http(),
  },
  ssr: true,
})
```

## 🎯 Environment Detection

The system automatically detects the environment and loads appropriate providers:

### Detection Logic
```typescript
// Browser: Default environment, full RainbowKit setup
if (no Farcaster indicators) → 'browser'

// Farcaster Web: Frame integration, web-optimized UI
if (window.farcaster || window.minikit) → 'farcaster-web'

// Farcaster Mobile: Native mobile patterns
if (Farcaster + mobile user agent) → 'farcaster-mobile'
```

### Testing Environments
```bash
# Browser (current behavior)
npm run dev  # Normal Next.js development

# Farcaster Web (simulated)
# Add to browser console: window.farcaster = {}; location.reload()

# Farcaster Mobile (simulated) 
# Use mobile device emulation + add window.farcaster
```

## 🔄 Wallet Connection Flow

### Browser Environment (Existing)
1. User clicks "Connect Wallet" 
2. RainbowKit modal shows wallet options
3. User selects wallet (MetaMask, WalletConnect, etc.)
4. Wallet connects via wagmi hooks
5. Firebase authentication with wallet address

### Farcaster Environments (New)
1. Automatic wallet detection via Farcaster SDK
2. One-click connection through Farcaster Mini App connector
3. Native Farcaster wallet integration
4. Same Firebase authentication pattern
5. Enhanced with Farcaster user info display

## 🛡️ Security & Compatibility

### Wallet Support
- **Browser**: All RainbowKit wallets (MetaMask, WalletConnect, Coinbase, etc.)
- **Farcaster Web**: Farcaster embedded wallet + injected wallets
- **Farcaster Mobile**: Farcaster native wallet + mobile wallets

### Network Configuration
- **Primary**: Base Mainnet (chain ID: 8453)
- **Testing**: Base Sepolia (chain ID: 84532)
- **Fallback**: Ethereum Mainnet (chain ID: 1)

### Transaction Features
- Standard EIP-1193 Ethereum provider API
- Batch transactions via `wallet_sendCalls` (Farcaster environments)
- Transaction scanning and validation
- Smart contract interactions (unchanged)

## 🚀 Deployment Considerations

### Environment Variables Checklist
```bash
# Required for Farcaster integration
NEXT_PUBLIC_CDP_CLIENT_API_KEY=

# Existing (already configured)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=
```

### Build Configuration
No additional build configuration required. The system uses dynamic imports and client-side environment detection.

### Farcaster Mini App Submission
After full integration:
1. Test in Farcaster development environment
2. Submit to Farcaster App Store
3. Configure Farcaster Frame metadata
4. Enable deep linking from Farcaster feeds

## 🔍 Debugging & Monitoring

### Console Logs
The system provides detailed logging for environment detection and provider loading:

```bash
# Environment detection
🌐 Browser environment detected (default)
🎯 Farcaster environment detected  
📱 MiniKit environment detected

# Provider loading
🚀 Multi-Environment Provider System Active
🌐 Loading Browser Providers (RainbowKit)
🎯 Loading Farcaster Web Providers
📱 Loading Farcaster Mobile Providers

# MiniKit integration
📱 MiniKit frame ready
🔗 Farcaster SDK detected and ready
```

### Development Tools
```bash
# Check current environment
localStorage.debug = 'flamabb:*'  # Enable debug logging

# Force environment (testing)
localStorage.setItem('flamabb:force-env', 'farcaster-web')

# Reset environment detection
localStorage.removeItem('flamabb:force-env')
```

## 📈 Next Steps

1. **Install Dependencies** - Add required npm packages
2. **Get API Key** - Register with Coinbase Developer Platform  
3. **Replace Placeholder Components** - Implement actual MiniKit integration
4. **Test Environments** - Verify functionality in all 3 environments
5. **Deploy & Submit** - Deploy to production and submit to Farcaster App Store

The foundation is complete - the multi-environment system is ready for full Farcaster integration! 🚀