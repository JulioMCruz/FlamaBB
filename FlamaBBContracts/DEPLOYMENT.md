# 🚀 FlamaBB Smart Contract Deployment Guide

## 📋 Prerequisites

### 1. Get Base Sepolia ETH
- Visit [Base Sepolia Faucet](https://docs.base.org/tools/network-faucets/)
- Or use [Alchemy Faucet](https://sepoliafaucet.com/)
- You need ~0.01 ETH for deployment of all 3 contracts

### 2. Create Deployment Wallet
```bash
# Option 1: Generate new wallet
npx hardhat console --network base-sepolia
# In console: ethers.Wallet.createRandom()

# Option 2: Use existing wallet
# Export private key from MetaMask (Account Details > Export Private Key)
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your values:
# PRIVATE_KEY=your-64-character-private-key-without-0x-prefix
# BASESCAN_API_KEY=your-basescan-api-key-from-basescan.org
```

### 4. Get Basescan API Key
1. Visit [Basescan API](https://basescan.org/apis)
2. Create account and generate API key
3. Add to your .env file

## 🚀 Deployment Steps

### Step 1: Verify Setup
```bash
# Check balance and network connection
npm run check-setup
```

### Step 2: Deploy Contracts
```bash
# Deploy all upgradeable contracts to Base Sepolia
npm run deploy:base-sepolia
```

### Step 3: Verify Contracts
```bash
# Verify on Basescan
npm run verify:base-sepolia
```

## 📊 Expected Output

```
🚀 Starting FlamaBB OpenZeppelin upgradeable contracts deployment...
📍 Network: base-sepolia (84532)
👤 Deploying with account: 0x...
💰 Account balance: 0.0234 ETH

📦 Deploying PaymentEscrowUpgradeable...
✅ PaymentEscrowUpgradeable proxy deployed to: 0x...
🔧 Implementation deployed to: 0x...

📦 Deploying ExperienceManagerUpgradeable...
✅ ExperienceManagerUpgradeable proxy deployed to: 0x...
🔧 Implementation deployed to: 0x...

📦 Deploying FlamaBBRegistryUpgradeable...
✅ FlamaBBRegistryUpgradeable proxy deployed to: 0x...
🔧 Implementation deployed to: 0x...

📁 Deployment info saved to: deployments/base-sepolia-84532.json
```

## 🔧 Contract Addresses for Frontend

After deployment, update your frontend `.env.local` with:

```bash
# Smart Contract Addresses (Base Sepolia)
NEXT_PUBLIC_EXPERIENCE_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
```

## 🛡️ Security Notes

1. **Never commit .env file** - Contains private key
2. **Use testnet first** - Always test on Base Sepolia before mainnet
3. **Verify on Basescan** - Ensures contract source code is public
4. **Fund deployment wallet** - Ensure sufficient ETH for gas fees

## 🔍 Verification Commands

```bash
# Verify individual contracts
npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS>

# Check contract on Basescan
# Visit: https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>
```

## 📝 Contract Features

### PaymentEscrowUpgradeable
- Milestone-based payments (5% → 40% → 35% → 20%)
- Coinbase server wallet integration
- Automatic refunds on cancellation
- Platform fee handling (0.5%)

### ExperienceManagerUpgradeable  
- Experience lifecycle management
- Registration and check-in tracking
- Integration with payment escrow
- Admin controls and pausing

### FlamaBBRegistryUpgradeable
- Experience discovery and categorization
- Review and rating system
- User reputation tracking
- City and category indexing