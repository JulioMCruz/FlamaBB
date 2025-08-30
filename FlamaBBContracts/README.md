# FlamaBB Smart Contracts

Smart contracts for the FlamaBB social experiences platform, built with Hardhat and deployed on Base network.

## Overview

FlamaBB is a Web3-powered social platform that enables users to discover, create, and book local experiences worldwide. The smart contracts handle tokenomics, experience management, and user interactions.

## Architecture

### Contracts Structure
```
contracts/
├── FlamaBBToken.sol        # ERC20 token for platform economy
├── FlamaBBExperiences.sol  # Experience creation and booking
├── FlamaBBGovernance.sol   # DAO governance (future)
└── interfaces/             # Contract interfaces
```

### Key Features
- 🪙 **FLAMA Token**: ERC20 token for platform economy
- 🎯 **Experience Management**: Create, book, and manage local experiences
- 🔒 **Security**: OpenZeppelin-based contracts with best practices
- 🌐 **Base Network**: Optimized for Base Sepolia and Mainnet
- 🔍 **Verification**: Automated contract verification on Basescan

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

## Contract Addresses

### Base Sepolia
```
FlamaBBToken: TBD
FlamaBBExperiences: TBD
```

### Base Mainnet
```
FlamaBBToken: TBD
FlamaBBExperiences: TBD
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