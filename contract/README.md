# CapyData Smart Contracts

Move smart contracts for **CapyData** - a decentralized data marketplace built on the Sui blockchain.

## Overview

This directory contains the Move smart contracts that power CapyData's on-chain functionality:

- **Dataset listing and management** - Publish, delist, and update dataset metadata
- **Access control via NFTs** - NFT-gated dataset purchases with tiered fee structure
- **Seal integration** - Threshold encryption verification for data privacy

## Architecture

### Modules

#### `marketplace.move`
Core marketplace functionality for dataset management.

**Shared Objects:**
- `Marketplace` - Central registry tracking all listed datasets
- `Dataset` - Individual dataset metadata and ownership

**Key Functions:**
- `list_dataset()` - Publish a new dataset to the marketplace
- `delist_dataset()` / `relist()` - Toggle dataset listing status
- Getter/setter functions for dataset properties (title, description, price, tags, etc.)

**Events:**
- `MarketplaceCreated` - Emitted when marketplace is initialized
- `DatasetListed` - Emitted when dataset is published
- `DatasetDelisted` - Emitted when dataset is removed from sale

#### `access.move`
Purchase flow and access control enforcement.

**Objects:**
- `NFT` - Proof of dataset ownership (owned object)

**Key Functions:**
- `buy_dataset()` - Purchase dataset, receive NFT proving ownership
  - **Fee Structure:**
    - Price ≤ 100 SUI → 100% fee to marketplace owner
    - Price > 100 SUI → 1% fee to marketplace, 99% to seller
- `seal_approve()` - Validates NFT ownership before decryption
  - **Critical**: Must be called by frontend to enforce access control
  - Ensures only NFT holders can decrypt purchased data

**Events:**
- `DataPurchased` - Emitted on successful purchase with buyer, seller, price, and timestamp

### Data Structures

**`Dataset` (Shared Object):**
```move
public struct Dataset has key, store {
    id: UID,
    blob_id: String,      // Walrus storage blob ID
    owner: address,
    title: String,
    filename: String,
    filetype: String,
    description: String,
    tags: vector<String>,
    size: u64,            // File size in bytes
    price: u64,           // Price in MIST (1 SUI = 1e9 MIST)
    amount_sold: u64,
    release_date: u64,    // Unix timestamp
    on_sale: bool
}
```

**`NFT` (Owned Object):**
```move
public struct NFT has key, store {
    id: UID,
    dataset_id: ID        // References the Dataset object
}
```

**`Marketplace` (Shared Object):**
```move
public struct Marketplace has key {
    id: UID,
    owner: address,
    on_sale: vector<ID>   // IDs of currently listed datasets
}
```

## Development

### Prerequisites

- **Sui CLI** - Install from [docs.sui.io](https://docs.sui.io/guides/developer/getting-started/sui-install)
- **Move 2024.beta edition** - Configured in `Move.toml`

### Commands

```bash
# Build contracts
sui move build

# Run all tests
sui move test

# Run specific test
sui move test test_list_dataset

# Publish to network
sui client publish --gas-budget 100000000

# Publish to testnet (ensure active-env is testnet)
sui client switch --env testnet
sui client publish --gas-budget 100000000
```

### Testing

Tests use `#[test_only]` initialization function:

```move
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(MARKETPLACE {}, ctx);
}
```

This creates a `Marketplace` object for testing without redeploying.

## Deployment

### 1. Configure Network

```bash
# Check current network
sui client active-env

# Switch to desired network
sui client switch --env testnet
# or
sui client switch --env mainnet
```

### 2. Update Addresses

Edit `Move.toml`:

```toml
[addresses]
contract = "0x0"  # Will be replaced on publish
admin_addr = "0xYOUR_ADMIN_ADDRESS"
```

### 3. Deploy Contracts

```bash
sui client publish --gas-budget 100000000
```

**Important**: Save the output! You'll need:
- `packageId` - The deployed package ID
- `Marketplace` object ID - The shared Marketplace object

### 4. Update Frontend Configuration

After deployment, update `frontend/lib/constants.ts`:

```typescript
export const MARKETPLACE_PACKAGE_ID = "0xYOUR_PACKAGE_ID";
export const MARKETPLACE_OBJECT_ID = "0xYOUR_MARKETPLACE_OBJECT_ID";
```

And `frontend/.env.local`:

```bash
NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID=0xYOUR_PACKAGE_ID
NEXT_PUBLIC_MARKETPLACE_OBJECT_ID=0xYOUR_MARKETPLACE_OBJECT_ID
```

## Integration with Frontend

### Publishing a Dataset

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::marketplace::list_dataset`,
  arguments: [
    tx.pure.string(blobId),           // Walrus blob ID
    tx.pure.string(title),
    tx.pure.string(filename),
    tx.pure.string(filetype),
    tx.pure.string(description),
    tx.pure.vector('string', tags),
    tx.pure.u64(size),
    tx.pure.u64(price),               // In MIST
    tx.object(MARKETPLACE_OBJECT_ID),
    tx.object('0x6'),                 // Clock
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

### Purchasing a Dataset

```typescript
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::access::buy_dataset`,
  arguments: [
    tx.object(datasetId),
    tx.object(MARKETPLACE_OBJECT_ID),
    coin,
    tx.object('0x6'),                 // Clock
  ],
});
const result = await signAndExecuteTransaction({ transaction: tx });
// User receives NFT proving ownership
```

### Verifying Access Before Decryption

```typescript
// CRITICAL: Call this before allowing data decryption
const tx = new Transaction();
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::access::seal_approve`,
  arguments: [
    tx.pure.vector('u8', packageIdBytes),
    tx.object(datasetId),
    tx.object(nftId),                 // User's NFT
  ],
});
await signAndExecuteTransaction({ transaction: tx });

// Only proceed with decryption if seal_approve succeeds
```

## Key Concepts

### Shared Objects

Both `Marketplace` and `Dataset` are shared objects, allowing:
- **Concurrent reads** - Multiple users can query simultaneously
- **Consensus writes** - Modifications require network consensus
- **Global accessibility** - Any user can interact without ownership

### Clock Parameter

Time-dependent functions require Sui's shared `Clock` object:

```move
public fun list_dataset(..., clock: &Clock, ...) {
    let timestamp = clock.timestamp_ms() / 1000;
    // ...
}
```

Always pass `tx.object('0x6')` as the clock parameter in transactions.

### Access Control Flow

1. User purchases dataset via `buy_dataset()` → receives NFT
2. NFT proves ownership and grants decryption rights
3. Frontend calls `seal_approve()` with NFT before decryption
4. If `seal_approve()` succeeds, user can decrypt data
5. Without NFT, `seal_approve()` will abort with `EInvalidOwnership`

This enforces that only purchasers can access encrypted data.

## Fee Structure

Implemented in `access::buy_dataset()`:

| Dataset Price | Fee Distribution |
|--------------|------------------|
| ≤ 100 SUI | 100% to marketplace owner |
| > 100 SUI | 1% to marketplace owner, 99% to dataset seller |

```move
const FEE_RATE_BPS: u64 = 100;      // 100 basis points = 1%
const PRICE_THRESHOLD: u64 = 100;   // 100 SUI threshold
```

## Error Codes

**`marketplace.move`:**
- `ENotOwner` - Caller is not the dataset owner
- `ENegativePrice` - Price must be ≥ 0
- `EAlreadyMarketplaceOwner` - Already owns the marketplace
- `EDatasetNotListed` - Trying to delist an unlisted dataset
- `EDataListed` - Data is already listed
- `EDataObjectExisted` - Dataset already exists

**`access.move`:**
- `EInsufficientBalance` - Not enough SUI to purchase
- `EInvalidOwnership` - NFT doesn't match dataset (access denied)

## Security Considerations

1. **Access Control**: Always call `seal_approve()` before allowing decryption
2. **Shared Object Safety**: Dataset modifications check `owner` field
3. **Payment Validation**: `buy_dataset()` verifies sufficient balance
4. **No Re-entrancy**: Move's ownership model prevents re-entrancy attacks
5. **Integer Overflow**: Sui Move has built-in overflow checks

## Contributing

When adding new features:

1. Add tests in `tests/contract_tests.move`
2. Document new functions with comments
3. Emit events for significant state changes
4. Follow existing naming conventions
5. Update this README with integration examples

## Related Documentation

- [Sui Move Documentation](https://docs.sui.io/concepts/sui-move-concepts)
- [Sui Framework Reference](https://github.com/MystenLabs/sui/tree/main/crates/sui-framework/docs)
- [CapyData Frontend Integration](../frontend/README.md)

## License

See repository root for license information.
