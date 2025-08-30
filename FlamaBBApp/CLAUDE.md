# FlamaBBApp - Claude Code Project Documentation

## 🔥 Project Overview
FlamaBBApp is a Web3-enabled social platform for discovering and sharing experiences in Buenos Aires, Argentina. The app combines modern frontend technologies with blockchain integration and Firebase backend services.

## 🛠 Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

### Web3 Integration
- **RainbowKit 2.2.8** - Wallet connection UI
- **Wagmi 2.16.9** - React hooks for Ethereum
- **Viem 2.36.0** - TypeScript Ethereum library
- **Base Network** - Layer 2 blockchain (mainnet 8453, testnet 84532)

### Backend Services  
- **Firebase** - Authentication, Firestore database, storage, analytics
- **Firebase Admin SDK** - Server-side operations with admin privileges

## 📁 Project Structure

```
FlamaBBApp/
├── app/                     # Next.js App Router pages
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   ├── welcome-screen.tsx  # Landing/wallet connection
│   ├── onboarding-flow.tsx # User setup flow
│   ├── dashboard.tsx       # Main app interface
│   ├── wallet-header.tsx   # Persistent wallet status
│   └── providers.tsx       # Web3 & Firebase providers
├── lib/                    # Utility functions and configurations
│   ├── wagmi-config.ts     # Web3 wallet configuration
│   ├── firebase-config.ts  # Firebase client SDK
│   ├── firebase-admin.ts   # Firebase Admin SDK (server-side)
│   ├── firebase-auth.ts    # Authentication utilities
│   └── firebase-experiences.ts # Experience data management
├── hooks/                  # Custom React hooks
│   └── use-auth.ts        # Authentication state management
└── public/                # Static assets
```

## 🔐 Security Guidelines

### Environment Variables
**CRITICAL**: All sensitive data must be stored in environment files only:

- ✅ `.env.local` - Contains actual secrets (never commit to git)
- ✅ `.env.example` - Template for required variables (safe to commit)
- ❌ **NEVER** expose private keys, API keys, or credentials in:
  - Source code files (.ts, .tsx, .js, .jsx)
  - Configuration files (next.config.js, etc.)
  - Documentation files (.md)
  - Comments or console logs
  - Git commits or pull requests

### Required Environment Variables

**WalletConnect:**
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Firebase Client SDK:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

**Firebase Admin SDK (Server-side only):**
```bash
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key_content\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_here
```

## 🚀 Development Setup

### Installation
```bash
# Clone repository
git clone <repository-url>
cd FlamaBBApp

# Install dependencies (React 19 compatibility)
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

### Required External Setup
1. **WalletConnect Project ID**: https://cloud.walletconnect.com/
2. **Firebase Project**: https://console.firebase.google.com/
3. **Firebase Service Account**: Project Settings > Service Accounts

## 📱 App Features

### User Journey
1. **Welcome Screen** - Wallet connection with MetaMask/Base support
2. **Onboarding Flow** - City selection, interests, budget, profile setup
3. **Dashboard** - Experience discovery, creation, and social features

### Web3 Features
- MetaMask wallet integration
- Base network support (Layer 2 Ethereum)
- Persistent wallet connection status
- Automatic network switching

### Firebase Features
- User authentication (email/password)
- User profile management
- Experience CRUD operations
- Real-time data synchronization
- File storage for avatars/images
- Analytics tracking

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint code checking
npm run typecheck    # TypeScript type checking

# Firebase
npm run firebase:emulators  # Start Firebase emulators (if configured)
```

## 📊 Database Schema

### Users Collection
```typescript
interface UserProfile {
  uid: string
  email: string
  displayName: string
  bio?: string
  avatar?: string
  walletAddress?: string
  cities?: string[]
  interests?: string[]
  budget?: number
  createdAt: Timestamp
  lastLoginAt: Timestamp
}
```

### Experiences Collection
```typescript
interface Experience {
  id: string
  title: string
  description: string
  category: 'restaurant' | 'bar' | 'cultural' | 'outdoor' | 'shopping'
  location: {
    name: string
    address: string
    coordinates?: { lat: number, lng: number }
  }
  city: string
  priceRange: { min: number, max: number, currency: 'ETH' | 'USD' }
  images?: string[]
  createdBy: string
  participants: string[]
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Timestamp
}
```

## 🛡️ Security Best Practices

### Code Security
- Never hardcode sensitive values
- Use environment variables for all credentials
- Validate all user inputs
- Sanitize data before database operations
- Implement proper error handling without exposing sensitive info

### Firebase Security
- Use Firebase Security Rules for data access control
- Implement proper authentication checks
- Use Firebase Admin SDK only on server-side
- Monitor Firebase usage and costs

### Web3 Security  
- Validate wallet connections
- Implement proper transaction signing
- Handle network switching gracefully
- Never request unnecessary permissions

## 📝 Contributing Guidelines

### Before Making Changes
1. Ensure all environment variables are properly configured
2. Test wallet connections on both mainnet and testnet
3. Verify Firebase integration works correctly
4. Run linting and type checking

### Commit Guidelines
- Use conventional commit messages
- Never commit secrets or environment files
- Test all changes before pushing
- Document any new features or breaking changes

---

**⚠️ SECURITY REMINDER**: Always keep private keys and sensitive credentials in `.env.local` files only. Never expose them in source code, documentation, or version control.