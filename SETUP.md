# 🔥 FlamaBB Setup Guide

## 📁 Project Structure

```
flamabb/
├── .env                    # ← Single source of truth for all environment variables
├── env.example            # ← Template with placeholder values
├── FlamaBBApp/            # ← Next.js Frontend (port 3000)
│   ├── components/        # React components
│   ├── lib/              # Firebase config, utilities
│   └── package.json
├── backend/               # ← Express.js Backend (port 3001)
│   ├── src/
│   │   ├── config/       # Firebase admin config
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript definitions
│   └── package.json
└── FlamaBBContracts/      # ← Hardhat Smart Contracts
    ├── contracts/        # Solidity contracts
    ├── scripts/          # Deployment scripts
    └── package.json
```

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Base network access
- Firebase project (for database)

### 1. Clone Repository
```bash
git clone https://github.com/your-team/flamabb
cd flamabb
```

### 2. Install Dependencies
```bash
# Frontend (Next.js)
cd FlamaBBApp && npm install --legacy-peer-deps

# Backend (Express.js)
cd ../backend && npm install

# Smart Contracts (Hardhat)
cd ../FlamaBBContracts && npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your actual values
nano .env
```

### 4. Required Environment Variables

#### Firebase Configuration
```env
# Firebase Client (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin (Backend)
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

#### WalletConnect
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

#### Server Configuration
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 5. Start Development Servers

#### Terminal 1: Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

#### Terminal 2: Frontend
```bash
cd FlamaBBApp
npm run dev
# App runs on http://localhost:3000
```

#### Terminal 3: Smart Contracts (Optional)
```bash
cd FlamaBBContracts
npx hardhat node
# Local blockchain on http://localhost:8545
```

### 6. Verify Setup

#### Test Backend
```bash
# Health check
curl http://localhost:3001/health

# Environment variables
curl http://localhost:3001/api/test/env

# Firebase connection
curl http://localhost:3001/api/test/firebase
```

#### Test Frontend
- Open http://localhost:3000
- Connect wallet
- Complete onboarding flow

## 🔧 Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Frontend Development
```bash
cd FlamaBBApp
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
```

### Smart Contract Development
```bash
cd FlamaBBContracts
npx hardhat compile  # Compile contracts
npx hardhat test     # Run tests
npx hardhat deploy   # Deploy to network
```

## 🔐 Security Notes

### Environment Variables
- **Never commit `.env` file** - It's in `.gitignore`
- **Use `env.example`** - Safe template with placeholders
- **Single source of truth** - All services use root `.env`

### Firebase Security
- **Service account** - Backend only, never expose to frontend
- **Client config** - Frontend only, safe to expose
- **Rules** - Configure Firestore security rules

### Wallet Security
- **Private keys** - Never store in code or environment
- **Signing** - Always use wallet for transactions
- **Verification** - Verify signatures on backend

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check environment variables
curl http://localhost:3001/api/test/env

# Check Firebase connection
curl http://localhost:3001/api/test/firebase
```

#### Frontend Won't Connect
```bash
# Check CORS settings
# Verify backend is running on port 3001
# Check browser console for errors
```

#### Firebase Connection Fails
```bash
# Verify service account credentials
# Check Firebase project permissions
# Ensure Firestore is enabled
```

### Debug Commands
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd FlamaBBApp && npm run dev

# Check environment
cat .env | grep FIREBASE
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Base Network Documentation](https://docs.base.org)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow setup guide
4. Make changes
5. Test thoroughly
6. Submit pull request

---

**🔥 Happy coding with FlamaBB!**
