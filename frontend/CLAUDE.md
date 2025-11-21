# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CapyData** ("The Chillest Data Marketplace") is a decentralized data marketplace built on the **Sui blockchain**, utilizing **Walrus** for decentralized storage and **Seal** protocol for encryption. The project is a monorepo with two main components:
- `/frontend` - Next.js 16 web application (this directory)
- `/contract` - Move smart contracts for the Sui blockchain

## Commands

### Development
```bash
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Note: This project uses `pnpm` as the package manager.

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

**Required Variables:**
- `NEXT_PUBLIC_SUI_NETWORK` - Sui network (testnet/mainnet/devnet/localnet)
- `NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID` - Deployed marketplace contract package ID
- `NEXT_PUBLIC_SEAL_PACKAGE_ID` - Seal protocol package ID
- `NEXT_PUBLIC_SEAL_KEY_SERVERS` - Seal key servers (format: `objectId1,weight1;objectId2,weight2`)
- `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL` - Walrus aggregator endpoint
- `NEXT_PUBLIC_WALRUS_EPOCHS` - Walrus storage epochs (default: 100)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.0
- **TypeScript**: v5 with strict mode
- **Styling**: Tailwind CSS v4 (using new `@theme` directive)
- **Fonts**: Space Grotesk (sans), JetBrains Mono (mono) via next/font
- **Icons**: Lucide React

**Blockchain Integration:**
- **Sui SDK**: `@mysten/sui` - Core Sui blockchain interaction
- **Dapp Kit**: `@mysten/dapp-kit` - Wallet connection and transaction signing
- **Walrus**: `@mysten/walrus` - Decentralized storage (dynamically imported)
- **Seal Protocol**: `@mysten/seal` - End-to-end encryption for data privacy
- **State Management**: `@tanstack/react-query` (v5) - Server state and caching
- **Animation**: `framer-motion` - Advanced animations

## Architecture

### Project Structure

```
/app                         # Next.js App Router pages
  /page.tsx                 # Homepage
  /layout.tsx               # Root layout
  /globals.css              # Tailwind v4 config & animations
  /publish/page.tsx         # Data publishing wizard
  /marketplace/page.tsx     # Browse datasets
  /item/[id]/page.tsx       # Dataset detail view
  /profile/[address]/page.tsx # User profile
  /governance/page.tsx      # DAO voting & data farming

/components
  /Common                   # Reusable UI primitives (Button, Card, Input, Badge, Modal, LoadingSpinner)
  /Global
    /Web3                   # Blockchain-specific components
      SuiProvider.tsx       # Top-level Web3 provider (combines QueryClient + SuiClient + WalletProvider)
      WalletButton.tsx      # Connect wallet UI
      AddressDisplay.tsx    # Format & display Sui addresses
      TokenBalance.tsx      # Display SUI/CAPY token balances
      NetworkSwitcher.tsx   # Switch between Sui networks
    /Toast                  # Toast notification system
  /Home                     # Homepage sections (Hero, Stats, TopDataset, Flow, WhyUs)
  /Publish                  # Publishing flow wizard components
  /ItemDetail               # Dataset detail page components
  /Profile                  # User profile tabs (Published, Downloads, Financials)
  /Governance               # DAO & staking components
  Navbar.tsx                # Global navigation
  Footer.tsx                # Site footer
  FooterSlide.tsx           # Animated footer element
  CustomAnimation.tsx       # Global animation orchestration

/hooks                      # Custom React hooks
  useWalrus.ts             # Walrus storage operations (upload/fetch blobs)
  useSeal.ts               # Seal encryption/decryption
  useMarketplace.ts        # High-level marketplace operations (combines Seal + Walrus)
  useToast.ts              # Toast notification hook

/lib                        # Utilities and configuration
  sui.ts                   # Sui network config, token definitions, explorer URL helpers
  constants.ts             # Package IDs and server object IDs
  mockData.ts              # Mock data for development
  utils.ts                 # General utility functions

/type                       # TypeScript type definitions
  Item.ts                  # Asset/Dataset type interface

/public                     # Static assets
```

### Path Aliases

The project uses `@/*` path alias pointing to the root directory:
```typescript
import Hero from "@/components/Home/Hero";
import { useWalrus } from "@/hooks/useWalrus";
import { formatSUI } from "@/lib/sui";
```

### Styling Architecture (Tailwind CSS v4)

Tailwind v4 is configured using the `@theme` directive in `app/globals.css`.

**Brand Color Palette:**
- `void`: #0c0c0c (dark background)
- `panel`: #161616 (panel background)
- `yuzu`: #FF9F1C (primary accent - orange)
- `capy-brown`: #C69C6D (capybara brown)
- `capy-dark`: #8D6E4E (darker brown)
- `hydro`: #4ECDC4 (teal accent)
- `grass`: #95D600 (green accent)
- `border`: #262626 (border color)

**Custom Animations:**
- `animate-marquee` - Horizontal scrolling text
- `animate-float` - Floating effect (6s ease-in-out)
- `animate-steam` - Steam rising effect
- `animate-blink` - Blinking animation
- `animate-nose` - Subtle scale pulse

Use via Tailwind classes: `bg-void`, `text-yuzu`, `border-border`, `animate-float`, etc.

### Layout Pattern

Global layout (`app/layout.tsx`) structure:
1. `<SuiProvider>` - Web3 context (wallet, blockchain, query client)
2. `<ToastProvider>` - Global notifications
3. `<CustomAnimations>` - Global animation setup (IntersectionObserver, parallax)
4. `<Navbar>` - Fixed navigation with wallet connection
5. Page content (`{children}`)
6. `<Footer>` - Site footer
7. `<FooterSlide>` - Animated footer element

## Blockchain Integration Architecture

### Provider Hierarchy

```tsx
<SuiProvider>                           // Root Web3 provider
  <QueryClientProvider>                 // React Query for server state
    <SuiClientProvider>                 // Sui blockchain client
      <WalletProvider autoConnect>      // Wallet connection (auto-reconnect)
        <ToastProvider>                 // UI notifications
          {children}
        </ToastProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
</SuiProvider>
```

**Important**: `SuiProvider` must wrap the entire app. It's configured in `app/layout.tsx`.

### Data Flow: Publish → Encrypt → Store

When a user publishes a dataset, the following flow occurs:

1. **User uploads file** → `PublishWizard` component
2. **File encryption** → `useSeal().encrypt(fileBytes)` - Encrypts data using Seal protocol (threshold encryption with key servers)
3. **Upload to Walrus** → `useWalrus().uploadFileToWalrus(encryptedBytes)` - Stores encrypted blob on decentralized storage
4. **Get blob ID** → Returns `blobId` (unique identifier for retrieval)
5. **On-chain registration** → (Future: Call Move contract to register asset metadata + blobId)

**Key Insight**: Files are **encrypted before storage**. Only authorized users can decrypt via Seal protocol.

### Data Flow: Purchase → Decrypt → Download

When a user purchases and downloads a dataset:

1. **User clicks download** → `useMarketplace().getFile(blobId)`
2. **Fetch encrypted blob** → `useWalrus().fetchBlobFromWalrus(blobId)`
3. **Decrypt data** → `useSeal().decrypt(encryptedBytes)` - Requires wallet signature for session key
4. **Return file** → Decrypted `File` object ready for download

### Custom Hooks Architecture

**`useWalrus()`** - Walrus storage integration
- Dynamically imports `@mysten/walrus` (client-side only to avoid WASM issues)
- Returns `{ uploadFileToWalrus, fetchBlobFromWalrus, isReady }`
- `isReady` tracks whether the Walrus SDK has loaded
- Uses Sui transactions for blob registration and certification

**`useSeal()`** - Seal encryption/decryption
- Initializes `SealClient` with key server configs from `lib/constants.ts`
- `encrypt(bytes)` - Threshold encryption (2-of-N key servers)
- `decrypt(encryptedBytes)` - Requires user wallet signature for session key approval
- Session keys have TTL (10 minutes default)

**`useMarketplace()`** - Orchestrates Seal + Walrus
- High-level API: `uploadFile()`, `getFile()`
- Manages loading states
- Combines encryption → storage → retrieval flow
- Returns `{ uploadFile, getFile, loading, isReady }`

**`useToast()`** - Global notification system
- Access via `const { showToast } = useToast()`
- Types: `success`, `error`, `info`, `warning`

### Sui Network Configuration

Network configs defined in `lib/sui.ts`:
- `mainnet`, `testnet`, `devnet`, `localnet`
- Default network: `testnet`
- Explorer URLs: SuiScan (`https://suiscan.xyz/{network}`)

**Helpers:**
- `formatSUI(amount, decimals)` - Format token amounts
- `getTxExplorerUrl(txHash, network)` - Get transaction explorer link
- `getAddressExplorerUrl(address, network)` - Get address explorer link

### Type Definitions

**Asset** (`type/Item.ts`):
```typescript
{
  id: string;              // On-chain asset ID
  blob_id: string;         // Walrus storage blob ID
  owner: string;           // Sui address of publisher
  title: string;
  description: string;
  tags: string[];
  price: number;           // In CAPY tokens (or SUI)
  amount_sold: number;     // Sales count
  release_date: string;    // ISO date
}
```

## Development Patterns

### 1. Client Components with Dynamic Imports

Walrus SDK uses WASM and must be loaded client-side:

```tsx
// ✅ Correct - Dynamic import with no SSR
const PublishWizard = dynamic(
  () => import("@/components/Publish/PublishWizard"),
  { ssr: false }
);
```

### 2. Wallet-Aware Components

Components that interact with blockchain must check wallet connection:

```tsx
import { useCurrentAccount } from "@mysten/dapp-kit";

function MyComponent() {
  const account = useCurrentAccount();
  const address = account?.address;

  if (!address) {
    return <div>Please connect wallet</div>;
  }

  // ... render authenticated content
}
```

### 3. Transaction Signing Pattern

```tsx
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::module::function`,
  arguments: [/* ... */],
});

const { digest } = await signAndExecuteTransaction({ transaction: tx });
```

### 4. Toast Notifications

```tsx
import { useToast } from "@/hooks/useToast";

const { showToast } = useToast();

showToast({
  type: "success",
  message: "Dataset published successfully!",
});
```

### 5. Progressive Enhancement with Animations

UI elements use `.reveal` class for scroll-triggered animations (managed by `CustomAnimation.tsx`):

```tsx
<div className="reveal delay-100">
  {/* Content animates in when scrolled into view */}
</div>
```

Stagger delays: `.delay-100`, `.delay-200`, `.delay-300`

### 6. Glass Morphism UI Pattern

Standard panel styling:

```tsx
<div className="bg-panel/90 backdrop-blur-md border border-border rounded-xl p-6">
  {/* Glassmorphic content */}
</div>
```

## Key Constraints & Gotchas

1. **WASM Loading**: Walrus SDK uses WASM. Always use `dynamic()` with `{ ssr: false }` for components that import it.

2. **Package IDs Required**: The app will not function without deployed contracts. Set `NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID` and `NEXT_PUBLIC_SEAL_PACKAGE_ID` in `.env.local`.

3. **Seal Key Servers**: Encryption requires active key servers. Configure `NEXT_PUBLIC_SEAL_KEY_SERVERS` with valid object IDs.

4. **Session Keys Expire**: Seal decryption uses session keys with 10-minute TTL. Users may need to re-sign if keys expire.

5. **Network Mismatch**: Ensure wallet is connected to the same network as `NEXT_PUBLIC_SUI_NETWORK`.

6. **Lucide Icons**: Loaded via CDN in `layout.tsx`, initialized client-side by `CustomAnimation.tsx` using `createIcons()`.

7. **React 19**: This project uses React 19 which may have breaking changes from React 18 (e.g., `use client` is required for many hooks).

## Implementation Status

**Implemented:**
- ✅ Sui wallet connection (Dapp Kit)
- ✅ Walrus storage integration (upload/fetch)
- ✅ Seal encryption/decryption
- ✅ Publishing wizard UI (multi-step form)
- ✅ Marketplace browsing UI
- ✅ Profile pages
- ✅ Toast notification system
- ✅ Network switching
- ✅ Token balance display

**Partially Implemented:**
- ⚠️ On-chain contract integration (hooks exist, contracts deployed but not fully connected)
- ⚠️ Asset purchasing flow (UI ready, smart contract calls need implementation)
- ⚠️ Profile data fetching (UI ready, needs indexer/subgraph)

**Not Yet Implemented:**
- ❌ Governance/DAO voting logic
- ❌ Data farming/staking mechanics
- ❌ Search and filtering (UI exists, no backend)
- ❌ Real asset indexing (currently uses mock data)
- ❌ Compute-to-Data features
- ❌ Access control enforcement

## Common Development Tasks

### Adding a New Page

1. Create page file: `app/new-page/page.tsx`
2. Mark as client component if using hooks: `"use client"`
3. Follow layout pattern (see "Layout Pattern" above)
4. Add navigation link in `components/Navbar.tsx`

### Calling a Move Contract

1. Define package ID in `lib/constants.ts`
2. Create transaction:
```tsx
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::module::function_name`,
  arguments: [tx.pure.string("arg1"), tx.object("objectId")],
});
```
3. Sign and execute using `useSignAndExecuteTransaction()`
4. Show toast notification for success/error

### Integrating New Sui Objects

1. Add type definitions to `/type`
2. Create custom hook in `/hooks` for object interactions
3. Use `useSuiClient()` for queries, `useSignAndExecuteTransaction()` for mutations
4. Leverage React Query for caching and refetching

### Working with Encrypted Data

Always use the `useMarketplace()` hook for file operations:
- **Publish**: `uploadFile(file, metadata...)` - Auto-encrypts and stores
- **Download**: `getFile(blobId, filename, filetype)` - Auto-fetches and decrypts
- **Check readiness**: `isReady` flag ensures Walrus SDK is loaded

## Related Documentation

- [Sui Blockchain Docs](https://docs.sui.io)
- [Walrus Storage](https://docs.walrus.site)
- [Seal Protocol](https://seal-docs.wal.app/)
- [Dapp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Next.js 16](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
