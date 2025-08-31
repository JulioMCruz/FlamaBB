# 🔥 FlamaBB Smart Contracts

OpenZeppelin upgradeable smart contracts for the FlamaBB social experiences platform, deployed on Base network.

## 🎯 Project Overview

FlamaBB smart contracts solve the trust gap in authentic travel experiences by enabling secure, milestone-based payments between strangers through blockchain escrow. The contracts support a dual wallet architecture where users have personal wallets while experiences use Coinbase Developer Platform server wallets for seamless payment processing.

**Core Innovation**: Anonymous social interactions with selective identity reveal, powered by smart contract escrow that releases payments based on experience milestones (advance → check-in → completion).

## 🏗️ Smart Contract Architecture

### Contract System
```
contracts/
├── ExperienceManagerUpgradeable.sol   # Experience lifecycle management
├── PaymentEscrowUpgradeable.sol       # Milestone-based payment system  
└── FlamaBBRegistryUpgradeable.sol     # Discovery and reputation system
```

### Core Features
- 🔄 **Upgradeable Contracts**: OpenZeppelin UUPS proxy pattern for future improvements
- 💰 **Milestone Payments**: 5% advance → 40% check-in → 35% mid-experience → 20% completion
- 🏦 **Coinbase Integration**: Server wallets for experience creators, personal wallets for participants
- 🛡️ **Security**: ReentrancyGuard, Pausable, Ownable with comprehensive error handling
- 📊 **Reputation System**: Anonymous reviews with Web3 reputation tracking
- 🌐 **Base Network**: Optimized for low-cost, fast transactions

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm/npm/yarn
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd FlamaBB/FlamaBBContracts

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Setup
Edit `.env` with your configuration:
```env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### Development Commands

```bash
# Compile contracts
npm run build

# Run tests
npm run test

# Run test coverage
npm run test:coverage

# Lint contracts
npm run lint

# Format code
npm run format

# Start local node
npm run node
```

## Deployment

### Base Sepolia (Testnet)
```bash
# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Verify contracts
npm run verify:base-sepolia
```

### Base Mainnet
```bash
# Deploy to Base Mainnet
npm run deploy:base

# Verify contracts
npm run verify:base
```

### Deployment Info
Deployment information is saved to `deployments/` directory in JSON format:
```json
{
  "network": "base-sepolia",
  "chainId": 84532,
  "contracts": {
    "FlamaBBToken": {
      "address": "0x...",
      "txHash": "0x...",
      "deployer": "0x...",
      "timestamp": 1234567890,
      "args": ["FlamaBB Token", "FLAMA", "1000000000000000000000000"]
    }
  }
}
```

## Network Configuration

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://bridge.base.org

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## 📋 Deployed Contracts

### Base Sepolia (Testnet)
| Contract | Address | Basescan Link |
|----------|---------|---------------|
| **PaymentEscrowUpgradeable** | `0x053F3EB75c9E78F5D53b9aEab16DfD006Cb1A08c` | [View on Basescan](https://sepolia.basescan.org/address/0x053F3EB75c9E78F5D53b9aEab16DfD006Cb1A08c) |
| **ExperienceManagerUpgradeable** | `0x9E904aaf00ad1B0578588C56301319255218522D` | [View on Basescan](https://sepolia.basescan.org/address/0x9E904aaf00ad1B0578588C56301319255218522D) |
| **FlamaBBRegistryUpgradeable** | `0x480b1f8aEF49c02334CA17A598bEc8dA7d5b1B28` | [View on Basescan](https://sepolia.basescan.org/address/0x480b1f8aEF49c02334CA17A598bEc8dA7d5b1B28) |

**Deployer Address**: `0x56714aDF9A17b7748388f3350320beDa83970278`  
**Network**: Base Sepolia (Chain ID: 84532)  
**Deployment Date**: August 31, 2025

### Base Mainnet
```
Contracts: Not yet deployed
```

## Development Guidelines

### Code Style
- Follow Solidity style guide
- Use OpenZeppelin contracts for standards
- Write comprehensive tests for all functions
- Document all public functions with NatSpec

### Security
- All contracts use OpenZeppelin base contracts
- Comprehensive test coverage required
- Slither static analysis recommended
- Multi-signature wallets for mainnet deployments

### Testing
```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/FlamaBBToken.test.ts

# Run with gas reporting
REPORT_GAS=true npm run test

# Coverage report
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure deployer wallet has ETH
2. **Gas estimation failed**: Check contract logic and network status
3. **Verification failed**: Ensure contract is deployed and Basescan API key is valid
4. **RPC errors**: Verify RPC URLs and network connectivity

### Support
- Check Hardhat documentation: https://hardhat.org/docs
- Base network documentation: https://docs.base.org
- OpenZeppelin documentation: https://docs.openzeppelin.com

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Run tests and linting
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Links

- [FlamaBB App](../FlamaBBApp/)
- [Base Network](https://base.org)
- [OpenZeppelin](https://openzeppelin.com)
- [Hardhat](https://hardhat.org)