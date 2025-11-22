# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CapyData** ("The Chillest Data Marketplace") is a decentralized data marketplace monorepo built on the **Sui blockchain**. It enables users to publish, encrypt, store, and trade datasets using:
- **Sui blockchain** - Smart contract platform for ownership and transactions
- **Walrus** - Decentralized storage for dataset blobs
- **Seal protocol** - Threshold encryption for data privacy

## Repository Structure

This is a monorepo with two main components:
```
/frontend       # Next.js 16 web application
/contract       # Move smart contracts for Sui blockchain
```

Each directory has its own CLAUDE.md with detailed information. See:
- `/frontend/CLAUDE.md` - Frontend architecture, commands, and patterns
- `/contract/CLAUDE.md` - Smart contract notes

## Commands

### Frontend Development
```bash
cd frontend
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Smart Contract Development
```bash
cd contract
sui move build                    # Build Move contracts
sui move test                     # Run all tests
sui client publish --gas-budget 100000000  # Deploy to network
```

**Important**: When deploying contracts, update the package IDs in `frontend/lib/constants.ts`.

## Architecture

### Data Flow: Publish → Encrypt → Store → Purchase

**Publishing Flow:**
1. User uploads file via `PublishWizard` component
2. File encrypted using Seal protocol (threshold encryption with key servers)
3. Encrypted blob uploaded to Walrus decentralized storage → returns `blobId`
4. On-chain transaction via `marketplace::list_dataset` registers metadata + `blobId`
5. Dataset becomes discoverable in marketplace

**Purchase & Access Flow:**
1. User calls `access::buy_dataset` on-chain (pays SUI, receives NFT)
2. Frontend fetches encrypted blob from Walrus using `blobId`
3. Seal protocol decrypts data (requires wallet signature for session key)
4. Access control enforced via `access::seal_approve` - checks NFT ownership
5. User downloads decrypted file

### Smart Contract Architecture

**`contract::marketplace`** - Dataset listing and management
- `Marketplace` (shared object) - Central registry, tracks `on_sale` datasets
- `Dataset` (shared object) - Metadata, pricing, ownership, `blob_id` reference
- Key functions:
  - `list_dataset(blob_id, title, description, tags, price, ...)` - Publish dataset
  - `delist_dataset(dataset)` / `relist(dataset)` - Toggle listing status
  - Getter/setter functions for dataset properties

**`contract::access`** - Purchasing and access control
- `NFT` (owned object) - Proves dataset ownership, contains `dataset_id`
- `buy_dataset(dataset, coin, ...)` - Purchase dataset, receive NFT
  - Tiered fee: If price ≤ 100 SUI → 100% fee to marketplace owner
  - If price > 100 SUI → 1% fee to marketplace, rest to seller
- `seal_approve(_id, dataset, nft)` - Validates NFT ownership before decryption
  - **Critical**: Frontend must call this before allowing data decryption
  - Ensures only NFT holders can decrypt purchased data

**Shared Objects**:
- `Marketplace` - Single shared instance created at deployment
- `Dataset` - Each dataset is a shared object (allows concurrent reads)
- `Clock` - Pass `0x6` as the clock parameter when calling time-dependent functions

### Frontend-Contract Integration

**Key Integration Points:**
1. `useMarketplace().publishDataset()` → calls `marketplace::list_dataset`
2. `useMarketplace().purchaseDataset()` → calls `access::buy_dataset`
3. Before decryption → Frontend must call `access::seal_approve` with user's NFT
4. `useMarketplace().getAllListings()` → Queries all `Dataset` shared objects
5. `useMarketplace().getUserDatasets()` → Queries user's owned NFTs

**Configuration** (`frontend/lib/constants.ts`):
```typescript
export const MARKETPLACE_PACKAGE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID
export const MARKETPLACE_OBJECT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_OBJECT_ID
```

## Environment Setup

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet

# Contract Package IDs (update after deployment)
NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID=0x...
NEXT_PUBLIC_MARKETPLACE_OBJECT_ID=0x...  # Shared Marketplace object ID
NEXT_PUBLIC_SEAL_PACKAGE_ID=0x...

# Seal Key Servers (format: objectId1,weight1;objectId2,weight2)
NEXT_PUBLIC_SEAL_KEY_SERVERS=0x...,1;0x...,1

# Walrus Storage
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://...
NEXT_PUBLIC_WALRUS_EPOCHS=100
```

## Tech Stack

**Frontend:**
- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4 (custom color scheme, animations)
- Sui SDK (`@mysten/sui`, `@mysten/dapp-kit`)
- Walrus SDK (`@mysten/walrus`) - dynamically imported (WASM)
- Seal SDK (`@mysten/seal`) - encryption/decryption
- React Query v5 - state management
- Framer Motion - animations

**Smart Contracts:**
- Move language (2024.beta edition)
- Sui Framework
- Deployed on Sui testnet/mainnet

## Development Patterns

### 1. Transaction Signing Pattern

```typescript
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";

const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

const tx = new Transaction();
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::marketplace::list_dataset`,
  arguments: [
    tx.pure.string(blobId),
    tx.pure.string(title),
    // ... other args
    tx.object(MARKETPLACE_OBJECT_ID),
    tx.object('0x6'), // Clock
  ],
});

const { digest } = await signAndExecuteTransaction({ transaction: tx });
```

### 2. Access Control Pattern

Before decrypting purchased data, **always verify NFT ownership**:

```typescript
// After user purchases dataset and receives NFT
const tx = new Transaction();
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::access::seal_approve`,
  arguments: [
    tx.pure.vector('u8', packageIdBytes),
    tx.object(datasetId),
    tx.object(nftId), // User's NFT proving ownership
  ],
});
await signAndExecuteTransaction({ transaction: tx });

// Only proceed with decryption if seal_approve succeeds
const decryptedFile = await useSeal().decrypt(encryptedBytes);
```

### 3. AppContext Pattern

Global state managed via `AppContextProvider`:
- `allListings` - All marketplace datasets
- `userDatasets` - Current user's owned dataset NFT IDs
- `fetchListings()` - Refresh marketplace data
- `fetchUserDatasets()` - Refresh user's owned datasets

Wrap app in `AppContextProvider` (already done in `frontend/app/layout.tsx`).

### 4. Dynamic Imports for WASM

Walrus SDK uses WASM and **must** be client-side only:

```typescript
const PublishWizard = dynamic(
  () => import("@/components/Publish/PublishWizard"),
  { ssr: false }
);
```

## Key Constraints

1. **Seal Access Control**: The `seal_approve` function validates NFT ownership. Frontend **must** call this before decryption to enforce access control. Without this call, users could decrypt data they didn't purchase.

2. **Shared Object Concurrency**: `Dataset` and `Marketplace` are shared objects. Multiple transactions can read simultaneously, but writes require consensus. Design for concurrent access.

3. **Clock Parameter**: Time-dependent functions require Sui's shared `Clock` object (`0x6`). Pass as argument to `list_dataset`, `buy_dataset`, etc.

4. **Package IDs**: After deploying contracts, update all package IDs in `frontend/lib/constants.ts` and `.env.local`. The app will not function with incorrect IDs.

5. **Walrus WASM**: Components using `@mysten/walrus` must disable SSR via `dynamic(() => ..., { ssr: false })`. Check `useWalrus().isReady` before operations.

6. **Session Key Expiry**: Seal decryption uses session keys with 10-minute TTL. Users may need to re-sign wallet requests if keys expire.

7. **Network Consistency**: Ensure wallet network matches `NEXT_PUBLIC_SUI_NETWORK`. Provide network switching UI.

## Common Development Workflows

### Adding a New Dataset Field

1. Update `Dataset` struct in `contract/sources/marketplace.move`
2. Add getter/setter functions in marketplace module
3. Update `Asset` type in `frontend/type/Item.ts`
4. Modify `list_dataset` transaction in `frontend/hooks/useMarketplace.ts`
5. Update UI components that display/edit the field
6. Rebuild and redeploy contract, update package ID

### Implementing a Purchase Flow

1. User clicks "Purchase" on dataset detail page
2. Call `access::buy_dataset` via transaction (pays SUI)
3. User receives NFT, event `DataPurchased` emitted
4. Frontend listens for transaction confirmation
5. Store NFT ID in local state
6. When user clicks "Download":
   - Call `access::seal_approve` with NFT
   - Fetch encrypted blob from Walrus
   - Decrypt using Seal
   - Trigger browser download

### Testing Smart Contracts

```bash
cd contract
sui move test                     # Run all tests
sui move test test_list_dataset   # Run specific test
```

Tests use `#[test_only]` function `init_for_testing` to initialize the `Marketplace` object.

## Project Context

This project was developed for a blockchain hackathon. Some features are partially implemented:
- Governance/DAO voting (UI exists, no contract logic)
- Data farming/staking (UI exists, no contract logic)
- Search/filtering (UI exists, uses mock data)
- Compute-to-Data (not implemented)

Focus on core marketplace functionality: publish, list, purchase, decrypt.
- If you test the frontend by running "pnpm dev", remember to terminate if before completing the prompt.