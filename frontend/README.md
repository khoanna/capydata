# CapyData Frontend

Web application for **CapyData** - "The Chillest Data Marketplace" built on Sui blockchain with Walrus storage and Seal encryption.

## Overview

A Next.js 16 application providing a complete decentralized data marketplace experience:

- 🔐 **End-to-end encryption** - Seal protocol with threshold encryption
- 🌐 **Decentralized storage** - Walrus for blob storage
- ⛓️ **Blockchain-based ownership** - Sui NFTs prove dataset ownership
- 💼 **Publisher-friendly** - Easy dataset publishing with metadata management
- 🛒 **Seamless purchasing** - Integrated wallet transactions with automatic decryption

## Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** package manager
- **Sui wallet** browser extension (Sui Wallet, Suiet, Ethos, etc.)
- **Deployed contracts** - See [contract deployment guide](../contract/README.md)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables (see Configuration section)
# Edit .env.local with your values

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Configuration

Create `.env.local` with the following variables:

```bash
# Sui Network Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet  # testnet | mainnet | devnet | localnet

# Smart Contract Package IDs (update after deployment)
NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID=0xYOUR_PACKAGE_ID
NEXT_PUBLIC_MARKETPLACE_OBJECT_ID=0xYOUR_MARKETPLACE_OBJECT_ID

# Seal Protocol Configuration
NEXT_PUBLIC_SEAL_PACKAGE_ID=0xSEAL_PACKAGE_ID
NEXT_PUBLIC_SEAL_KEY_SERVERS=0xKEY_SERVER_1,1;0xKEY_SERVER_2,1

# Walrus Storage Configuration
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_EPOCHS=100  # Storage duration in epochs
```

### Getting Configuration Values

**Package IDs**: Deploy the smart contracts first (see `../contract/README.md`), then copy the package ID and Marketplace object ID from deployment output.

**Seal Configuration**: See [Seal documentation](https://seal-docs.wal.app/) for key server setup.

**Walrus Configuration**: See [Walrus documentation](https://docs.walrus.site) for aggregator URLs and epoch information.

## Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS v4** - Utility-first CSS with `@theme` directive
- **Framer Motion** - Advanced animations
- **Lucide React** - Icon library

### Blockchain & Web3
- **@mysten/sui** - Sui blockchain SDK
- **@mysten/dapp-kit** - Wallet connection and transaction signing
- **@mysten/walrus** - Decentralized storage
- **@mysten/seal** - End-to-end encryption
- **@tanstack/react-query v5** - Server state management

### Fonts
- **Space Grotesk** - Primary sans-serif (via `next/font`)
- **JetBrains Mono** - Monospace font

## Architecture

### Project Structure

```
/app                              # Next.js App Router
  /page.tsx                      # Homepage
  /layout.tsx                    # Root layout with providers
  /globals.css                   # Tailwind v4 config + animations
  /publish/page.tsx              # Dataset publishing wizard
  /marketplace/page.tsx          # Browse datasets
  /item/[id]/page.tsx            # Dataset detail view
  /profile/[address]/page.tsx    # User profile
  /governance/page.tsx           # DAO & data farming (UI only)

/components
  /Common                        # Reusable UI (Button, Card, Input, Badge, Modal, LoadingSpinner)
  /Global
    /Web3                        # Blockchain components
      SuiProvider.tsx            # Top-level Web3 provider
      WalletButton.tsx           # Connect wallet UI
      AddressDisplay.tsx         # Format Sui addresses
      TokenBalance.tsx           # Display SUI/CAPY balances
      NetworkSwitcher.tsx        # Network switching
    /Toast                       # Toast notification system
  /Home                          # Homepage sections
  /Publish                       # Publishing wizard components
  /ItemDetail                    # Dataset detail components
  /Profile                       # Profile tabs
  /Governance                    # DAO components (not implemented)
  Navbar.tsx                     # Global navigation
  Footer.tsx                     # Site footer
  FooterSlide.tsx                # Animated footer
  CustomAnimation.tsx            # Animation orchestration

/hooks                           # Custom React hooks
  useWalrus.ts                  # Walrus upload/fetch
  useSeal.ts                    # Seal encrypt/decrypt
  useMarketplace.ts             # High-level marketplace ops
  useToast.ts                   # Toast notifications

/context
  AppContext.tsx                # Global state (listings, user datasets)

/lib                             # Utilities
  sui.ts                        # Network config, token formatting
  constants.ts                  # Package IDs, server object IDs
  mockData.ts                   # Mock data for development
  utils.ts                      # General utilities

/type
  Item.ts                       # Asset/Dataset type definitions

/public                          # Static assets
```

### Path Aliases

Import from root using `@/*`:

```typescript
import Hero from "@/components/Home/Hero";
import { useWalrus } from "@/hooks/useWalrus";
import { formatSUI } from "@/lib/sui";
```

## Styling System

### Tailwind CSS v4

Configuration uses `@theme` directive in `app/globals.css`.

**Brand Colors:**
```css
--void: #0c0c0c;           /* Dark background */
--panel: #161616;          /* Panel background */
--yuzu: #FF9F1C;           /* Primary accent (orange) */
--capy-brown: #C69C6D;     /* Capybara brown */
--capy-dark: #8D6E4E;      /* Darker brown */
--hydro: #4ECDC4;          /* Teal accent */
--grass: #95D600;          /* Green accent */
--border: #262626;         /* Border color */
```

Usage: `bg-void`, `text-yuzu`, `border-border`

**Custom Animations:**
- `animate-marquee` - Horizontal scrolling
- `animate-float` - Floating effect (6s)
- `animate-steam` - Steam rising
- `animate-blink` - Blinking
- `animate-nose` - Subtle pulse

### Glass Morphism Pattern

Standard panel styling:

```tsx
<div className="bg-panel/90 backdrop-blur-md border border-border rounded-xl p-6">
  {/* Content */}
</div>
```

### Scroll Animations

Use `.reveal` class for scroll-triggered animations:

```tsx
<div className="reveal delay-100">
  {/* Animates in when scrolled into view */}
</div>
```

Stagger delays: `.delay-100`, `.delay-200`, `.delay-300`

## Data Flow Architecture

### Provider Hierarchy

```tsx
<SuiProvider>                    // Root Web3 provider
  <QueryClientProvider>          // React Query
    <SuiClientProvider>          // Sui blockchain client
      <WalletProvider>           // Wallet connection
        <AppContextProvider>     // Global app state
          <ToastProvider>        // Notifications
            {children}
          </ToastProvider>
        </AppContextProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
</SuiProvider>
```

All configured in `app/layout.tsx`.

### Publish Flow: Upload → Encrypt → Store → Register

```typescript
// 1. User uploads file via PublishWizard
const file = userSelectedFile;

// 2. Encrypt with Seal
const { encrypt } = useSeal();
const encryptedBytes = await encrypt(await file.arrayBuffer());

// 3. Upload to Walrus
const { uploadFileToWalrus } = useWalrus();
const blobId = await uploadFileToWalrus(new File([encryptedBytes], filename));

// 4. Register on-chain
const tx = new Transaction();
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::marketplace::list_dataset`,
  arguments: [
    tx.pure.string(blobId),
    tx.pure.string(title),
    // ... metadata
    tx.object(MARKETPLACE_OBJECT_ID),
    tx.object('0x6'), // Clock
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

**Key Point**: Files are **encrypted before storage**. Only authorized users can decrypt.

### Purchase & Download Flow: Buy → Verify → Fetch → Decrypt

```typescript
// 1. Purchase dataset
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::access::buy_dataset`,
  arguments: [
    tx.object(datasetId),
    tx.object(MARKETPLACE_OBJECT_ID),
    coin,
    tx.object('0x6'),
  ],
});
const result = await signAndExecuteTransaction({ transaction: tx });
// User receives NFT

// 2. Verify NFT ownership (CRITICAL for access control)
const verifyTx = new Transaction();
verifyTx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::access::seal_approve`,
  arguments: [
    verifyTx.pure.vector('u8', packageIdBytes),
    verifyTx.object(datasetId),
    verifyTx.object(nftId),
  ],
});
await signAndExecuteTransaction({ transaction: verifyTx });

// 3. Fetch encrypted blob from Walrus
const { fetchBlobFromWalrus } = useWalrus();
const encryptedBytes = await fetchBlobFromWalrus(blobId);

// 4. Decrypt with Seal
const { decrypt } = useSeal();
const decryptedFile = await decrypt(encryptedBytes, filename, filetype);

// 5. Download to user's device
const url = URL.createObjectURL(decryptedFile);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
```

## Custom Hooks

### `useWalrus()`

Walrus storage integration (WASM-based, client-side only).

```typescript
const { uploadFileToWalrus, fetchBlobFromWalrus, isReady } = useWalrus();

// Check if SDK loaded
if (!isReady) return <LoadingSpinner />;

// Upload file
const blobId = await uploadFileToWalrus(file);

// Fetch blob
const bytes = await fetchBlobFromWalrus(blobId);
```

**Important**:
- Uses dynamic import (`ssr: false`) to avoid WASM issues
- Check `isReady` before operations
- Uses Sui transactions for blob certification

### `useSeal()`

Seal encryption/decryption with threshold encryption.

```typescript
const { encrypt, decrypt } = useSeal();

// Encrypt data
const encryptedBytes = await encrypt(fileBytes);

// Decrypt data (requires wallet signature)
const decryptedFile = await decrypt(encryptedBytes, filename, filetype);
```

**Session Keys**:
- Decryption requires user wallet signature for session key approval
- Session keys have 10-minute TTL
- User may need to re-sign if keys expire

### `useMarketplace()`

High-level API combining Seal + Walrus + smart contracts.

```typescript
const { uploadFile, getFile, loading, isReady } = useMarketplace();

// Publish dataset (encrypts + uploads + registers on-chain)
await uploadFile(file, {
  title,
  description,
  tags,
  price,
});

// Download dataset (fetches + decrypts)
await getFile(blobId, filename, filetype);
```

### `useToast()`

Global notification system.

```typescript
const { showToast } = useToast();

showToast({
  type: 'success',  // 'success' | 'error' | 'info' | 'warning'
  message: 'Dataset published successfully!',
});
```

## Development Patterns

### 1. Client Components with Dynamic Imports

Walrus SDK uses WASM and must be loaded client-side:

```tsx
// ✅ Correct
const PublishWizard = dynamic(
  () => import("@/components/Publish/PublishWizard"),
  { ssr: false }
);

// ❌ Incorrect
import PublishWizard from "@/components/Publish/PublishWizard";
```

### 2. Wallet-Aware Components

```tsx
"use client";
import { useCurrentAccount } from "@mysten/dapp-kit";

function MyComponent() {
  const account = useCurrentAccount();

  if (!account) {
    return <WalletButton />;
  }

  return <div>Welcome {account.address}</div>;
}
```

### 3. Transaction Signing

```tsx
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

const handleTransaction = async () => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::module::function`,
    arguments: [/* ... */],
  });

  try {
    const { digest } = await signAndExecuteTransaction({ transaction: tx });
    showToast({ type: 'success', message: 'Transaction successful!' });
  } catch (error) {
    showToast({ type: 'error', message: error.message });
  }
};
```

### 4. Querying Blockchain Data

```tsx
import { useSuiClient } from "@mysten/dapp-kit";

const client = useSuiClient();

// Get object
const dataset = await client.getObject({
  id: datasetId,
  options: { showContent: true },
});

// Query by type
const datasets = await client.getOwnedObjects({
  owner: address,
  filter: { StructType: `${PACKAGE_ID}::marketplace::Dataset` },
});
```

### 5. Access Control Pattern

**CRITICAL**: Always verify NFT ownership before allowing decryption:

```tsx
const downloadDataset = async (datasetId, nftId, blobId) => {
  // 1. Verify access
  const tx = new Transaction();
  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::access::seal_approve`,
    arguments: [
      tx.pure.vector('u8', packageIdBytes),
      tx.object(datasetId),
      tx.object(nftId),
    ],
  });

  try {
    await signAndExecuteTransaction({ transaction: tx });
  } catch (error) {
    showToast({ type: 'error', message: 'Access denied' });
    return;
  }

  // 2. Only proceed if verification passed
  const encryptedData = await fetchBlobFromWalrus(blobId);
  const decryptedFile = await decrypt(encryptedData);
  // ... download file
};
```

## Common Tasks

### Adding a New Page

1. Create `app/new-page/page.tsx`
2. Mark as client component if using hooks: `"use client"`
3. Add navigation link in `components/Navbar.tsx`
4. Follow layout pattern (see existing pages)

### Calling a Smart Contract

1. Define package ID in `lib/constants.ts`
2. Create transaction with `Transaction()`
3. Use `tx.moveCall()` with target and arguments
4. Sign with `useSignAndExecuteTransaction()`
5. Show toast for success/error

### Working with Encrypted Data

Always use `useMarketplace()` hook:

```typescript
const { uploadFile, getFile, isReady } = useMarketplace();

// Wait for SDK
if (!isReady) return <LoadingSpinner />;

// Publish (auto-encrypts)
await uploadFile(file, metadata);

// Download (auto-decrypts)
await getFile(blobId, filename, filetype);
```

### Integrating New Sui Objects

1. Add type definitions to `/type`
2. Create custom hook in `/hooks`
3. Use `useSuiClient()` for queries
4. Use `useSignAndExecuteTransaction()` for mutations
5. Leverage React Query for caching

## Type Definitions

### Asset (Dataset)

```typescript
interface Asset {
  id: string;              // On-chain asset ID
  blob_id: string;         // Walrus blob ID
  owner: string;           // Sui address
  title: string;
  description: string;
  tags: string[];
  price: number;           // In CAPY or SUI
  amount_sold: number;     // Sales count
  release_date: string;    // ISO date
  filename: string;
  filetype: string;
  size: number;            // Bytes
  on_sale: boolean;
}
```

## Key Constraints & Gotchas

1. **WASM Loading**: Always use `dynamic()` with `{ ssr: false }` for Walrus components
2. **Package IDs Required**: App won't function without deployed contracts
3. **Seal Session Keys**: Expire after 10 minutes, may require re-signing
4. **Network Mismatch**: Wallet network must match `NEXT_PUBLIC_SUI_NETWORK`
5. **Access Control**: Must call `seal_approve()` before decryption
6. **Shared Objects**: `Dataset` and `Marketplace` allow concurrent reads
7. **Clock Parameter**: Always pass `tx.object('0x6')` for time-dependent functions
8. **React 19**: Uses React 19 which requires `"use client"` for many hooks

## Implementation Status

**Implemented:**
- ✅ Wallet connection (Dapp Kit)
- ✅ Walrus storage (upload/fetch)
- ✅ Seal encryption/decryption
- ✅ Publishing wizard UI
- ✅ Marketplace browsing UI
- ✅ Profile pages
- ✅ Toast notifications
- ✅ Network switching
- ✅ Token balance display

**Partially Implemented:**
- ⚠️ On-chain contract integration (hooks exist, needs full connection)
- ⚠️ Purchase flow (UI ready, smart contract calls need implementation)
- ⚠️ Profile data fetching (UI ready, needs indexer)

**Not Implemented:**
- ❌ Governance/DAO voting
- ❌ Data farming/staking
- ❌ Search and filtering backend
- ❌ Real asset indexing (uses mock data)
- ❌ Compute-to-Data

## Troubleshooting

### Wallet Not Connecting

- Check wallet extension is installed and unlocked
- Verify network in wallet matches `NEXT_PUBLIC_SUI_NETWORK`
- Try refreshing page and reconnecting

### Transaction Failing

- Check gas balance (need SUI for transactions)
- Verify package IDs are correct in `.env.local`
- Check network consistency (wallet vs. app)
- Review error message in wallet popup

### Walrus Upload Failing

- Check `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL` is accessible
- Verify file size limits
- Check wallet has SUI for storage fees
- Ensure `useWalrus().isReady` is true

### Decryption Failing

- Verify user owns NFT for dataset
- Check session key hasn't expired (re-sign if needed)
- Ensure `seal_approve()` was called successfully
- Verify `NEXT_PUBLIC_SEAL_KEY_SERVERS` configuration

### Build Errors

- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Check Node.js version is 18+
- Verify all env variables are set

## Related Documentation

- [Sui Documentation](https://docs.sui.io)
- [Walrus Storage](https://docs.walrus.site)
- [Seal Protocol](https://seal-docs.wal.app/)
- [Dapp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Next.js 16](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Smart Contracts](../contract/README.md)

## Contributing

See repository root for contribution guidelines.

## License

See repository root for license information.
