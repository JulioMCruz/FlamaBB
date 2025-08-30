# CLAUDE.md - FlamaBB Project Instructions

Project-specific instructions for Claude Code SuperClaude framework.

## Project Overview

**FlamaBB** is a Web3-powered social experiences platform focused on local community experiences around the world. The application enables users to discover, create, and book curated local experiences with Web3 wallet integration and crypto payments.

**Core Features**:
- 🌍 Location-based experience discovery (Buenos Aires focus)
- 👥 Social community features with user profiles
- 💰 Web3 wallet integration (ETH payments)
- 🎯 Interest-based recommendations
- 📱 Mobile-first PWA design
- 🔗 Experience creation and booking system

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19 + Radix UI
- **Styling**: Tailwind CSS 4.1.9 + tailwindcss-animate
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React useState (local state)
- **Icons**: Lucide React
- **Charts**: Recharts

### Project Structure
```
FlamaBBApp/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── ui/                # Radix UI components (shadcn/ui)
│   └── *.tsx              # Feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
├── public/                # Static assets
└── styles/                # Global styles
```

### Key Components Architecture
- **WelcomeScreen**: Entry point with wallet connection
- **OnboardingFlow**: 5-step user setup (cities, interests, budget, profile)
- **Dashboard**: Main app interface with bottom navigation
- **ExploreExperiences**: Experience discovery and search
- **CreateExperienceFlow**: Experience creation workflow
- **WalletScreen**: Web3 wallet management
- **ProfileScreen**: User profile and settings

## Development Guidelines

### Code Conventions
- **Component Pattern**: Functional components with TypeScript
- **File Naming**: kebab-case for files, PascalCase for components
- **Import Style**: Absolute imports using `@/` prefix
- **State Management**: Local state with useState, props drilling for simple data flow
- **Styling**: Tailwind utility classes with custom gradients and animations
- **Form Validation**: Zod schemas with React Hook Form

### UI/UX Patterns
- **Design System**: Blue gradient theme (#3B82F6 to #1E40AF)
- **Layout**: Mobile-first, single-column layout (max-width: 384px)
- **Navigation**: Bottom tab navigation with 5 sections
- **Cards**: Rounded corners (rounded-2xl/3xl), backdrop blur effects
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Multi-step flows with progress indicators

### Component Organization
- **UI Components**: Atomic design in `/components/ui/`
- **Feature Components**: Screen-level components in `/components/`
- **Shared Hooks**: Custom hooks in `/hooks/`
- **Utilities**: Helper functions in `/lib/`

## Build & Development

### Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint (currently disabled in build)
```

### Configuration
- **TypeScript**: Strict mode enabled, Next.js plugin
- **ESLint**: Disabled during builds (development convenience)
- **Images**: Unoptimized (for deployment flexibility)
- **Package Manager**: pnpm with lock file

## Web3 Integration

### Wallet Features
- **Supported**: ETH payments and balances
- **UI**: Wallet balance display, transaction history
- **Budget System**: ETH allocation for experiences
- **Token Points**: Gamification with "TP" and purple tokens

### Business Logic
- **Experience Pricing**: ETH-based with USD conversion
- **Payment Flow**: Wallet connection → budget setting → experience booking
- **User Incentives**: Token rewards system for participation

## Content & Localization

### Target Market
- **Primary**: Buenos Aires, Argentina
- **Secondary**: Global cities (Paris, Tokyo, London, Singapore, Dubai, Sydney)
- **Language**: English (with Spanish locale considerations)
- **Culture**: Local experiences focus (Asados, Palermo bars, tours)

### Experience Categories
- 🍽️ Restaurants & Food (Asados, traditional cuisine)
- ☕ Bars & Cafés (Palermo nightlife)
- 🏛️ Cultural & Attractions
- 🎨 Art & Cultural events
- 🏔️ Outdoor Activities
- 🛍️ Shopping & Retail

## Development Priorities

### Quality Standards
- **Performance**: Mobile-optimized, fast loading
- **Accessibility**: Semantic HTML, keyboard navigation
- **SEO**: Next.js app router optimization
- **Security**: No sensitive data in client code

### Feature Priorities
1. **Core Flow**: Welcome → Onboarding → Dashboard → Explore
2. **Experience Management**: Create, browse, book experiences
3. **Web3 Integration**: Wallet connection, payments
4. **Social Features**: Profiles, following, community
5. **Localization**: Multi-city expansion

## Deployment Considerations

### Build Configuration
- ESLint errors ignored (development speed over strict linting)
- TypeScript errors ignored (flexibility during development)
- Images unoptimized (deployment platform agnostic)

### Asset Management
- **Images**: PNG assets in `/public/` (Buenos Aires themed)
- **Icons**: Lucide React components
- **Fonts**: Geist font family

## Commands & Workflows

### Recommended Claude Commands
- `/build` - Next.js development and build tasks
- `/implement` - Feature implementation with React/TypeScript
- `/improve --focus performance` - Mobile performance optimization
- `/improve --focus accessibility` - UI accessibility enhancements
- `/analyze --focus security` - Web3 security review

### Auto-Activations
- **Frontend Persona**: UI components, responsive design
- **Magic MCP**: Radix UI component generation
- **Context7 MCP**: Next.js and React patterns

### Testing Strategy
- **Manual Testing**: Mobile-first responsive testing
- **Component Testing**: Individual component functionality
- **Flow Testing**: Complete user journeys (onboarding, booking)
- **Web3 Testing**: Wallet integration and transaction flows

## Business Context

**FlamaBB** represents a new category of Web3 social apps focused on real-world experiences rather than purely digital interactions. The platform bridges crypto payments with local community engagement, targeting the growing market of crypto-native users seeking authentic local experiences.

**Key Success Metrics**:
- User onboarding completion rate
- Experience creation and booking rates  
- Wallet connection and payment success
- Geographic expansion (cities added)
- Community engagement (profiles, following)

---

*This CLAUDE.md provides Claude Code with comprehensive context for effective development assistance on the FlamaBB project.*