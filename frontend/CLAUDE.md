# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **frontend** component of a **Decentralized Data Marketplace** called **CapyData** ("The Chillest Data Marketplace"). The project is a monorepo with two main components:
- `/frontend` - Next.js 16 web application (this directory)
- `/contract` - Move smart contracts for Sui blockchain integration

## Commands

### Development
```bash
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Note: This project uses `pnpm` as the package manager.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.0 with React 19 features
- **Blockchain**: Sui Network via @mysten/dapp-kit & @mysten/sui
- **State Management**: React Query (@tanstack/react-query)
- **Styling**: Tailwind CSS v4 (using new `@theme` directive in CSS)
- **TypeScript**: v5 with strict mode enabled
- **Fonts**: Space Grotesk (sans), JetBrains Mono (mono) via next/font
- **Icons**: Lucide icons loaded via CDN in layout

### Project Structure

```
/app                    # Next.js App Router pages
  page.tsx             # Homepage
  layout.tsx           # Root layout with fonts, providers, navbar, footer
  globals.css          # Tailwind config & custom animations
  /marketplace         # Data marketplace listing page
  /item/[id]           # Individual dataset detail page
  /publish             # Dataset publishing page
  /profile/[address]   # User profile page
  /governance          # Governance/voting page

/components
  /Home                # Homepage section components
    Hero.tsx
    Stats.tsx
    TopDataset.tsx
    Flow.tsx
    WhyUs.tsx
  /Global
    /Web3              # Blockchain integration components
      SuiProvider.tsx  # Sui network provider wrapper
      WalletButton.tsx # Wallet connection UI with account menu
      AddressDisplay.tsx
      TokenBalance.tsx
      NetworkSwitcher.tsx
    /Toast             # Toast notification system
      ToastProvider.tsx
  /Common              # Reusable UI components
    Button.tsx
    Modal.tsx
    Card.tsx
    Badge.tsx
    Input.tsx
    LoadingSpinner.tsx
    SkeletonCard.tsx
  Navbar.tsx
  Footer.tsx
  FooterSlide.tsx
  CustomAnimation.tsx

/lib                   # Utility libraries
  sui.ts              # Sui network config, formatting helpers
  utils.ts            # General utilities (address truncation, date formatting, etc.)
  mockData.ts         # Mock data for development

/hooks                 # Custom React hooks
  useToast.ts         # Toast notification hook
```

### Blockchain Integration (Sui Network)

The application is integrated with **Sui blockchain** using the **@mysten/dapp-kit**:

**Provider Hierarchy** (in `app/layout.tsx`):
1. `SuiProvider` (wraps entire app)
   - `QueryClientProvider` (React Query)
   - `SuiClientProvider` (network configuration)
   - `WalletProvider` (wallet connection with autoConnect)
2. `ToastProvider` (notifications)

**Network Configuration** (`lib/sui.ts`):
- Supports mainnet, testnet, devnet, and localnet
- Default network: **testnet**
- Uses `createNetworkConfig` from @mysten/dapp-kit
- Explorer URLs point to suiscan.xyz

**Key Web3 Components**:
- `WalletButton.tsx`: Full-featured wallet connection UI with:
  - Wallet selection modal
  - Connected account dropdown menu
  - Balance display (SUI + mock CAPY token)
  - Network switcher
  - Address copy and explorer link
  - Profile/assets/downloads navigation
  - Disconnect functionality
- Uses hooks: `useCurrentAccount`, `useDisconnectWallet`, `useConnectWallet`, `useWallets`, `useSuiClientQuery`

**Utilities** (`lib/sui.ts`):
- `formatSUI()` - Format SUI amounts with decimals
- `getTxExplorerUrl()` - Get explorer URL for transactions
- `getAddressExplorerUrl()` - Get explorer URL for addresses
- `CAPY_TOKEN` - Mock CAPY token configuration

### Styling Architecture

**Tailwind CSS v4** is configured using the new `@theme` directive directly in `app/globals.css`. Custom theme includes:

**Color Palette** (brand colors):
- `void`: #0c0c0c (dark background)
- `panel`: #161616 (panel background)
- `yuzu`: #FF9F1C (primary accent - orange)
- `capy-brown`: #C69C6D (capybara brown)
- `capy-dark`: #8D6E4E (darker brown)
- `hydro`: #4ECDC4 (teal accent)
- `grass`: #95D600 (green accent)
- `border`: #262626 (border color)

**Custom Animations** (defined in globals.css):
- `animate-marquee`: Horizontal scrolling text
- `animate-float`: Floating effect (6s ease-in-out)
- `animate-steam`: Steam rising effect
- `animate-blink`: Blinking animation
- `animate-nose`: Subtle scale pulse

**Font Variables**:
- `font-sans`: Space Grotesk
- `font-mono`: JetBrains Mono

Use these custom colors via Tailwind classes: `bg-void`, `text-yuzu`, `border-border`, etc.

### Path Aliases

The project uses `@/*` path alias pointing to the root directory:
```typescript
import Hero from "@/components/Home/Hero";
import Navbar from "@/components/Navbar";
import { truncateAddress } from "@/lib/utils";
import { formatSUI, networkConfig } from "@/lib/sui";
```

### Layout Pattern

All pages use a consistent layout defined in `app/layout.tsx`:
1. `SuiProvider` (blockchain provider)
2. `ToastProvider` (notifications)
3. `CustomAnimations` (global animation setup)
4. `Navbar` (fixed at top, includes WalletButton)
5. Page content (children)
6. `Footer`
7. `FooterSlide` (animated footer element)

The homepage (`app/page.tsx`) is a client component that composes five main sections in order: Hero → Stats → TopDataset → Flow → WhyUs.

## Design Patterns

### 1. Component Composition
Pages are built by composing small, focused section components. The homepage demonstrates this pattern by composing `Hero`, `Stats`, `TopDataset`, `Flow`, and `WhyUs` components in sequence.

### 2. Provider Pattern for Web3
The application uses a layered provider pattern for Web3 integration:
- `QueryClientProvider` for React Query state management
- `SuiClientProvider` for Sui network connection
- `WalletProvider` for wallet connection management
- All providers are wrapped in a single `SuiProvider` component

### 3. Presentational Components
Most components are **pure presentational** - they are stateless functional components with minimal business logic. Data is currently hardcoded or mocked, ready to be replaced with blockchain queries when contracts are integrated.

### 4. Custom Hooks Pattern
Custom hooks are used for shared functionality:
- `useToast()` - Access toast notification context
- Sui hooks from @mysten/dapp-kit: `useCurrentAccount()`, `useWallets()`, `useSuiClientQuery()`

### 5. Side Effects Management
`CustomAnimation.tsx` is a specialized client component that returns `null` but manages global side effects:
- Initializes Lucide icons via `createIcons()`
- Sets up IntersectionObserver for `.reveal` elements (scroll-triggered animations)
- Implements mouse parallax tracking for `.animate-float` elements
- Properly cleans up event listeners in useEffect return

### 6. Animation Orchestration
Multi-layered animation system:
- **CSS animations**: Defined in `globals.css` using `@keyframes` (marquee, float, steam, blink, nose)
- **JavaScript animations**: Mouse tracking parallax, scroll-triggered reveals with IntersectionObserver
- **Staggered reveals**: Elements use `.reveal.delay-100`, `.delay-200`, `.delay-300` classes for sequential animation
- **Hover states**: Group hover patterns (`group` + `group-hover:`) for interactive feedback

### 7. Glass Morphism Visual Pattern
The UI heavily uses modern glass/neumorphic effects:
- `backdrop-blur-sm/md` for glassmorphic panels
- Semi-transparent backgrounds (`bg-void/90`, `bg-black/40`, `border-white/5`)
- Glow effects via box-shadow (`shadow-[0_0_20px_rgba(255,159,28,0.4)]`)
- Layered borders and translucent overlays
- Custom glass utility classes: `glass-card`, `glass-modal`, `glass-input`

### 8. Utility-First Styling (Tailwind)
Components use Tailwind's utility-first approach extensively:
- Custom design tokens for colors (`bg-yuzu`, `text-hydro`)
- Responsive breakpoints (`md:`, `lg:`)
- Hover and group-hover states inline
- Custom animations via Tailwind classes

### 9. Progressive Enhancement
UI elements progressively reveal and enhance:
- Elements marked with `.reveal` class animate in when scrolled into viewport
- Threshold: `0.1`, rootMargin: `0px 0px -50px 0px`
- Staggered delays create cascading effect
- Base styles work without JavaScript; animations enhance experience

### 10. Atomic Design Structure
Component hierarchy follows atomic design principles:
- **Atoms**: Buttons, badges, icons, inputs (in `/components/Common`)
- **Molecules**: Stat cards, navigation links, toast notifications
- **Organisms**: `Navbar`, `Footer`, `FooterSlide`, `WalletButton`
- **Templates**: `layout.tsx`
- **Pages**: Page compositions in `/app`

## Current Architecture State

This is an **MVP with Web3 integration in progress**. The following is the current implementation status:

**✅ Implemented:**
- Sui blockchain provider integration
- Wallet connection UI and account management
- Network configuration (mainnet/testnet/devnet/localnet)
- SUI balance querying
- React Query for data fetching
- Toast notification system
- Reusable UI component library
- Utility functions for blockchain operations

**❌ Not Yet Implemented:**
- Smart contract interaction (Move contracts exist in `/contract` but not connected)
- CAPY token (currently mocked)
- Actual dataset NFT minting/purchasing
- On-chain governance
- IPFS/decentralized storage integration
- Error boundaries
- Loading states for blockchain transactions

When implementing new features:
1. Use `useSuiClientQuery` for reading blockchain data
2. Use `useSignAndExecuteTransaction` for transactions
3. Add toast notifications for user feedback on blockchain operations
4. Handle loading and error states for async operations
5. Maintain the presentational component pattern
6. Use utility functions from `lib/sui.ts` and `lib/utils.ts`

## Development Notes

- All page components use `"use client"` directive (client-side rendering)
- Lucide icons are loaded via CDN (`unpkg.com`) in the layout head, then initialized client-side via `createIcons({ icons })`
- Selection styling is customized: `selection:bg-yuzu selection:text-black`
- Smooth scrolling enabled via `scroll-smooth` class on html element
- Overflow-x is hidden on body to prevent horizontal scroll
- IntersectionObserver watches all `.reveal` elements for scroll animations
- TypeScript strict mode is enabled - all components should be properly typed
- The project uses React 19 features - be mindful of API changes from React 18

## Smart Contract Integration

The project includes Move smart contracts located at `../contract/sources/`. While the frontend has Web3 infrastructure in place, contracts are not yet integrated. Future integration should:
1. Add contract module addresses to `lib/sui.ts`
2. Create transaction building utilities
3. Add hooks for contract interactions
4. Implement transaction signing and execution flows
5. Add transaction status monitoring and error handling
