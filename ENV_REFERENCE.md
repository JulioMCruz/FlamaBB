# 🔧 Environment Variables Reference

## 📍 File Location
All environment variables are stored in the root `.env` file and shared across all services.

## 🔐 Required Variables

### Firebase Configuration

#### Client-Side (Frontend)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

#### Server-Side (Backend)
```env
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### WalletConnect
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### Google Maps
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Server Configuration
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### JWT Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### Blockchain Configuration
```env
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453
CONTRACT_ADDRESS=your-smart-contract-address
```

### External Services
```env
IPFS_GATEWAY=https://ipfs.io/ipfs/
POAP_API_URL=https://api.poap.xyz
```

### Redis (Optional)
```env
REDIS_URL=redis://localhost:6379
```

## 🔍 How Variables Are Used

### Frontend (FlamaBBApp/)
- **NEXT_PUBLIC_*** variables are accessible in the browser
- Used for Firebase client configuration
- WalletConnect project ID for wallet connections

### Backend (backend/)
- **FIREBASE_*** variables for admin SDK
- **JWT_*** for authentication
- **CORS_*** for cross-origin requests
- **PORT** for server configuration

### Smart Contracts (FlamaBBContracts/)
- **BASE_*** variables for network configuration
- **PRIVATE_KEY** for deployment (if needed)

## 🛡️ Security Notes

### Safe to Expose (Client-Side)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Never Expose (Server-Side Only)
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `JWT_SECRET`
- `PRIVATE_KEY` (blockchain)

## 🧪 Testing Variables

### Backend Health Check
```bash
curl http://localhost:3001/health
```

### Environment Variables Test
```bash
curl http://localhost:3001/api/test/env
```

### Firebase Connection Test
```bash
curl http://localhost:3001/api/test/firebase
```

## 📝 Template File

Use `env.example` as a template:
```bash
cp env.example .env
# Edit .env with your actual values
```

## 🚨 Common Issues

### Missing Variables
- Check if all required variables are set
- Verify variable names match exactly
- Ensure no extra spaces or quotes

### Firebase Connection Fails
- Verify service account credentials
- Check project permissions
- Ensure Firestore is enabled

### Frontend Won't Connect
- Verify CORS settings
- Check backend is running
- Ensure wallet connection is configured

---

**💡 Tip**: Use the test endpoints to verify your configuration is working correctly!
