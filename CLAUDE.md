# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CapyData** ("The Chillest Data Marketplace") is a decentralized data marketplace built on blockchain technology. The project is a monorepo with two main components:

- `/frontend` - Next.js 16 application with Sui blockchain integration
- `/contract` - Move smart contracts (currently scaffolded but not implemented)

## Commands

### Frontend Development
```bash
cd frontend
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

**Important**: This project uses `pnpm` as the package manager, not npm or yarn.

### Smart Contract Development
The Move contracts are located in `/contract` but are currently empty scaffolds. When implementing:
- Edit: `contract/sources/contract.move`
- Tests: `contract/tests/contract_tests.move`
- Config: `contract/Move.toml`

Move package is configured for `edition = "2024.beta"` with the contract address set to `0x0`.

## Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router, React 19.2.0)
- **Blockchain**: Sui blockchain via `@mysten/dapp-kit` and `@mysten/sui`
- **Styling**: Tailwind CSS v4 (uses new `@theme` directive in CSS)
- **TypeScript**: v5 with strict mode
- **State Management**: React Query (`@tanstack/react-query`)
- **Icons**: Lucide icons loaded via CDN, initialized client-side

### Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage (client component)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Tailwind config & animations
│   ├── marketplace/page.tsx      # Browse assets
│   ├── item/[id]/page.tsx        # Asset detail pages (dynamic route)
│   ├── profile/[address]/page.tsx # User profiles (dynamic route)
│   ├── publish/page.tsx          # Publish wizard
│   └── governance/page.tsx       # DAO governance & data farming
│
├── components/
│   ├── Common/                   # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── SkeletonCard.tsx
│   ├── Global/                   # App-wide components
│   │   ├── Toast/                # Toast notification system
│   │   └── Web3/                 # Blockchain integration
│   │       ├── SuiProvider.tsx   # Sui wallet & network provider
│   │       ├── WalletButton.tsx  # Connect wallet button
│   │       ├── NetworkSwitcher.tsx
│   │       ├── TokenBalance.tsx
│   │       └── AddressDisplay.tsx
│   ├── Home/                     # Homepage sections
│   ├── Marketplace/              # Marketplace components
│   ├── ItemDetail/               # Asset detail components
│   ├── Profile/                  # User profile tabs
│   ├── Publish/                  # Publishing wizard steps
│   ├── Governance/               # Governance features
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── FooterSlide.tsx
│   └── CustomAnimation.tsx       # Global animation setup
│
├── lib/
│   ├── utils.ts                  # Utility functions
│   ├── mockData.ts               # Mock data & TypeScript types
│   └── sui.ts                    # Sui network configuration
│
└── tsconfig.json                 # Path alias: @/* → ./

contract/
├── sources/contract.move         # Main contract (empty scaffold)
├── tests/contract_tests.move     # Contract tests (empty scaffold)
└── Move.toml                     # Package configuration
```

### Key Design Patterns

**1. Multi-Layer Provider Architecture**

The app uses a nested provider structure in `layout.tsx`:
```
SuiProvider (Sui blockchain + React Query)
  → ToastProvider (Global notifications)
    → CustomAnimations (Global effects)
      → Navbar → Page Content → Footer → FooterSlide
```

**SuiProvider** wraps:
- `QueryClientProvider` (React Query for async state)
- `SuiClientProvider` (Sui blockchain client, defaults to testnet)
- `WalletProvider` (Wallet connection with autoConnect enabled)

**2. Mock Data Architecture**

All data is currently hardcoded in `lib/mockData.ts`. Key types:
- `Asset`: Core data asset type (dataset/algorithm/stream/storage)
- `AssetType`: "dataset" | "algorithm" | "stream" | "storage"
- `PriceModel`: "free" | "fixed" | "dynamic"
- `Chain`: "polygon" | "ethereum" | "bsc" | "moonriver" | "sui"

Functions: `getAssetById()`, `getAssetsByOwner()`, etc.

**When adding features**: Extract hardcoded data to props, then implement actual data fetching or blockchain queries.

**3. Sui Blockchain Integration**

Network configuration in `lib/sui.ts`:
- Supports mainnet, testnet, devnet, localnet
- Default network: **testnet**
- CAPY token config: 9 decimals, mock coin type `0x1234::capy::CAPY`
- Utility functions: `formatSUI()`, `getTxExplorerUrl()`, `getAddressExplorerUrl()`

**Important**: The Move contract is not yet implemented. The frontend uses mock data until blockchain integration is completed.

**4. Client-Side Rendering Pattern**

All pages use `"use client"` directive. This is intentional for:
- Wallet connection (browser-only Web3 APIs)
- Animation effects (IntersectionObserver, mouse tracking)
- Interactive UI with client state

**5. Dynamic Routes**

- `/item/[id]` - Asset detail pages using `use(params)` pattern (React 19)
- `/profile/[address]` - User profiles

Both use `getAssetById()` / mock data lookups with `notFound()` fallback.

**6. Animation System**

Multi-layered approach:
- **CSS animations**: Defined in `globals.css` (`@keyframes`)
  - `animate-marquee`, `animate-float`, `animate-steam`, `animate-blink`, `animate-nose`
- **JavaScript effects**: In `CustomAnimation.tsx`
  - Lucide icon initialization via `createIcons()`
  - IntersectionObserver for `.reveal` elements (scroll-triggered)
  - Mouse parallax tracking for `.animate-float` elements
  - Proper cleanup in useEffect return

Use `.reveal.delay-100`, `.delay-200`, `.delay-300` for staggered animations.

**7. Tailwind v4 Custom Theme**

Theme defined in `app/globals.css` using `@theme` directive:

**Brand Colors**:
- `void`: #0c0c0c (dark background)
- `panel`: #161616 (panel background)
- `yuzu`: #FF9F1C (primary accent - orange)
- `capy-brown`: #C69C6D (capybara brown)
- `capy-dark`: #8D6E4E (darker brown)
- `hydro`: #4ECDC4 (teal accent)
- `grass`: #95D600 (green accent)
- `border`: #262626 (border color)

Use via Tailwind classes: `bg-void`, `text-yuzu`, `border-border`, etc.

**Fonts**: Space Grotesk (sans), JetBrains Mono (mono)

**8. Glass Morphism UI**

Heavy use of modern glass effects:
- `backdrop-blur-sm/md` for glassmorphic panels
- Semi-transparent backgrounds: `bg-void/90`, `bg-black/40`, `border-white/5`
- Glow effects via box-shadow: `shadow-[0_0_20px_rgba(255,159,28,0.4)]`
- Use `.glass-input` custom class for form inputs

### What's NOT Yet Implemented

This is an **MVP/prototype**. The following are intentionally missing:

- ❌ No global state management (Context, Redux, Zustand)
- ❌ No real data fetching (all content in mockData.ts)
- ❌ No error boundaries
- ❌ No custom hooks (except CustomAnimation effects)
- ❌ No Move smart contract implementation
- ❌ No actual blockchain transactions (wallet connection only)

When adding features:
1. Extract mock data to API calls or blockchain queries
2. Add error boundaries for production resilience
3. Implement Move contracts in `/contract`
4. Connect frontend to smart contracts using `@mysten/sui`

## Development Notes

### Path Aliases
The project uses `@/*` path alias pointing to `frontend/` root:
```typescript
import { Asset } from "@/lib/mockData";
import Hero from "@/components/Home/Hero";
```

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- JSX: react-jsx (new React 19 transform)
- Module resolution: bundler

### Lucide Icons
Icons are loaded via CDN in layout head, then initialized client-side:
```typescript
// In CustomAnimation.tsx
import { createIcons, icons } from "lucide";
createIcons({ icons });
```

Use inline: `<i data-lucide="icon-name"></i>`

### IntersectionObserver Pattern
All elements with `.reveal` class animate in when scrolled into viewport:
- Threshold: 0.1
- rootMargin: `0px 0px -50px 0px`
- Stagger with `.delay-100`, `.delay-200`, `.delay-300`

### Utility Functions (`lib/utils.ts`)
Key utilities:
- `truncateAddress()` - Shorten wallet addresses
- `formatPrice()` - Format CAPY token amounts
- `capyToUSD()` / `formatUSD()` - Currency conversion (mock rate: 1 CAPY = $1.337)
- `stringToColor()` / `didToGradient()` - Generate colors from DIDs
- `formatFileSize()`, `formatDate()`, `timeAgo()`
- `copyToClipboard()`, `generateTxHash()`, `generateDID()`
- `isValidDID()` - Validate DID format `did:op:0x[64 hex chars]`

### Selection and Scroll
- Custom text selection: `selection:bg-yuzu selection:text-black`
- Smooth scrolling enabled: `scroll-smooth` on html element
- Overflow-x hidden on body to prevent horizontal scroll

## Codacy Integration

This project uses Codacy for code quality and security analysis. Important rules from `.cursor/rules/codacy.mdc`:

**CRITICAL**: After ANY file edit:
- MUST run `codacy_cli_analyze` tool for each edited file
- Propose and apply fixes for any issues found

**CRITICAL**: After installing dependencies:
- MUST run `codacy_cli_analyze` with `tool: "trivy"` for security scanning
- Fix vulnerabilities before continuing

**Do NOT**:
- Run analysis for duplicated code or complexity metrics
- Manually install Codacy CLI via brew/npm
- Run analysis for code coverage changes

If Codacy tools are unavailable, suggest the user check MCP server settings.
