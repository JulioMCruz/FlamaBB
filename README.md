# 🔥 FlamaBB - Passion for Beautiful Experiences

**A Social Web3 App for Urban Experiences**

*Built for the [Aleph Hackathon](https://dorahacks.io/hackathon/aleph-hackathon/detail) - Connecting communities through shared experiences on Base blockchain*

![FlamaBB Logo](public/flamabb-mascot.png)

## 🌟 Overview

FlamaBB is a decentralized social platform that revolutionizes how people discover, create, and participate in urban experiences. Built specifically for Buenos Aires as our MVP, FlamaBB enables users to organize and fund group experiences like traditional asados, bar tours, walking tours, and cultural activities through a transparent Web3 payment system.

Our platform combines the social aspects of experience sharing with blockchain technology to create trust, transparency, and community engagement in urban exploration.

## 🎯 Hackathon Tracks

This project is submitted to multiple tracks of the Aleph Hackathon:

- **[Base Track](https://dorahacks.io/hackathon/aleph-hackathon/base)** - Built on Base blockchain for transparent and efficient transactions
- **[v0 by Vercel Track](https://dorahacks.io/hackathon/aleph-hackathon/v0-by-vercel)** - Developed entirely using v0 for rapid prototyping and beautiful UI
- **[ENS Track](https://dorahacks.io/hackathon/aleph-hackathon/ens)** - Utilizing ENS as resolver for POAP count and Talent Protocol data

## ✨ Key Features

### 🔐 User Authentication & Verification
- **Wallet Connection**: Seamless Web3 wallet integration
- **Age Verification**: zkPassport integration ensuring users are 18+ years old
- **Profile Verification**: Talent Protocol scores and POAP collection display
- **Anonymous Profiles**: Privacy-first approach with nickname-based interactions

### 💝 Experience Discovery
- **Interest-Based Matching**: Users select preferences (food, bars, culture, etc.)
- **City-Focused**: Buenos Aires experiences including asados, bar tours, walking tours
- **Wishlist System**: Heart/like experiences to save for later
- **Community Engagement**: See flamitas (interest indicators) from other users

### 💰 Innovative Payment System
- **5% Advance Payment**: Show genuine interest by paying 5% of experience cost
- **Flexible Payment Structure**: Experience creators set check-in and mid-experience payment percentages
- **Transparent Escrow**: Smart contracts hold funds until experience completion
- **Automatic Distribution**: Seamless fund transfers based on participation milestones

### 🎨 Experience Creation
- **Easy Setup**: Multi-step flow for creating experiences
- **Flexible Pricing**: Set your own rates and payment structure
- **Participant Management**: Control maximum participants and requirements
- **Rich Media**: Add photos and detailed descriptions

### 📊 Community Features
- **Anonymous Reviews**: 1-5 flama rating system
- **Talent Protocol Integration**: Display reputation scores
- **POAP Verification**: Show community participation through collectibles
- **Privacy Controls**: Users remain anonymous while building reputation

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling with design system
- **shadcn/ui** - Beautiful, accessible UI components
- **v0 by Vercel** - AI-powered development platform

### Blockchain & Web3
- **Base Blockchain** - Layer 2 solution for efficient transactions
- **Smart Contracts** - Escrow and payment management
- **Wallet Integration** - Web3 wallet connectivity

### Identity & Verification
- **zkPassport** - Zero-knowledge age verification (18+ years)
- **ENS (Ethereum Name Service)** - Resolver for POAP and Talent Protocol data
- **Talent Protocol** - Reputation scoring system
- **POAP Integration** - Proof of Attendance Protocol for community engagement

### Development Tools
- **v0 by Vercel** - Primary development platform
- **Vercel** - Deployment and hosting
- **Git** - Version control

## 🏗 Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart          │    │   External      │
│   (Next.js)     │◄──►│   Contracts      │◄──►│   Services      │
│                 │    │   (Base)         │    │                 │
│ • User Interface│    │ • Escrow         │    │ • zkPassport    │
│ • Wallet Connect│    │ • Payments       │    │ • ENS           │
│ • Experience UI │    │ • Experience     │    │ • Talent Proto  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Base network access

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-team/flamabb
   cd flamabb
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   # Add your environment variables
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 How It Works

### For Experience Seekers
1. **Connect Wallet** - Link your Web3 wallet
2. **Complete Verification** - Age verification via zkPassport
3. **Set Preferences** - Choose interests and cities
4. **Discover Experiences** - Browse Buenos Aires activities
5. **Show Interest** - Heart experiences for your wishlist (free)
6. **Join Experience** - Pay 5% advance to secure your spot
7. **Participate** - Check-in and enjoy the experience
8. **Review** - Rate with 1-5 flamas anonymously

### For Experience Creators
1. **Create Account** - Set up your creator profile
2. **Design Experience** - Add details, photos, and pricing
3. **Set Payment Structure** - Configure check-in and completion percentages
4. **Publish** - Make your experience available
5. **Manage Participants** - Track registrations and payments
6. **Host Experience** - Lead your group activity
7. **Receive Payment** - Automatic fund distribution upon completion

## 👥 Team

Our diverse team of fullstack developers brings together expertise in Web3, frontend development, and user experience:

- **[Ileana](https://github.com/ileana-pr)** - Fullstack Developer
- **[0xOucan](https://github.com/0xOucan)** - Fullstack Developer  
- **[Julio M Cruz](https://github.com/JulioMCruz)** - Fullstack Developer

## 🔗 Important Links

### Hackathon
- [Aleph Hackathon Main](https://dorahacks.io/hackathon/aleph-hackathon/detail)
- [Base Track](https://dorahacks.io/hackathon/aleph-hackathon/base)
- [v0 Track](https://dorahacks.io/hackathon/aleph-hackathon/v0-by-vercel)
- [ENS Track](https://dorahacks.io/hackathon/aleph-hackathon/ens)

### Documentation
- [zkPassport Documentation](https://docs.zkpassport.id/intro)
- [zkPassport Age Verification](https://docs.zkpassport.id/examples/age-verification)
- [Base Documentation](https://docs.base.org/)
- [ENS Documentation](https://docs.ens.domains/)

## 🌟 Why FlamaBB?

### Innovation
- **First** Web3 platform specifically designed for urban experience sharing
- **Unique** payment structure that builds trust between strangers
- **Privacy-focused** while maintaining community accountability

### Social Impact
- **Community Building** - Connects people through shared interests
- **Local Economy** - Supports local experience creators and venues
- **Cultural Exchange** - Promotes authentic local experiences

### Technical Excellence
- **Built on Base** - Fast, cheap, and reliable transactions
- **Modern Stack** - Latest Web3 and frontend technologies
- **User-Centric** - Intuitive design built with v0

## 🎉 Special Thanks

Huge appreciation to **v0 by Vercel** for making this project possible! The AI-powered development experience allowed us to rapidly prototype and build a beautiful, functional application in record time. We love you v0! 💙

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

**Built with ❤️ for the Aleph Hackathon | Powered by Base, v0, and ENS**