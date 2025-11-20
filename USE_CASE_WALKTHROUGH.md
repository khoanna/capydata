# Complete Use Case Walkthrough: Sell & Buy Encrypted Data

## Scenario

**Alice** wants to sell her premium weather dataset for 100 SUI.
**Bob** and **Carol** want to buy access to this dataset.

---

## 🔵 PHASE 1: Alice Publishes Dataset (Seller)

### Step 1.1: Alice Creates Allowlist

```typescript
// In: frontend/components/Publish/PublishWizard.tsx
// When Alice clicks "Create New Allowlist"

import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

async function createAllowlist() {
  const tx = new Transaction();

  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::allowlist::create_allowlist_entry`,
    arguments: [
      tx.pure.string("Alice's Weather Data Allowlist"),
    ],
  });

  const result = await signAndExecuteTransaction({ transaction: tx });

  // Extract Cap object from transaction effects
  const cap = result.effects?.created?.find(obj =>
    obj.owner.AddressOwner === alice.address &&
    obj.type.includes('::allowlist::Cap')
  );

  const allowlist = result.effects?.created?.find(obj =>
    obj.owner.Shared &&
    obj.type.includes('::allowlist::Allowlist')
  );

  console.log("Created Allowlist ID:", allowlist.objectId);
  console.log("Cap ID:", cap.objectId);

  return {
    allowlistId: allowlist.objectId,
    capId: cap.objectId,
  };
}

// Alice gets:
// allowlistId: "0xabc123..." (shared object, everyone can read)
// capId: "0xdef456..." (owned by Alice, gives admin rights)
```

**Result**:
- ✅ Allowlist created: `0xabc123...`
- ✅ Cap owned by Alice: `0xdef456...`

---

### Step 1.2: Alice Uploads & Encrypts Dataset

```typescript
// In: frontend/components/Publish/DeployProgress.tsx
// When Alice clicks "Publish Dataset"

import { SealWalrusService } from '@/lib/seal-walrus';

const service = new SealWalrusService();
const file = new File([csvData], "weather-2024.csv"); // Alice's 50MB dataset
const allowlistId = "0xabc123..."; // From step 1.1
const datasetId = "weather-2024"; // Unique identifier

async function publishDataset() {
  // This does EVERYTHING:
  // 1. Encrypts with Seal
  // 2. Uploads to Walrus
  // 3. Returns blobId + metadata

  const result = await service.publishEncryptedDataset({
    file: file,
    allowlistId: allowlistId,
    datasetId: datasetId,
    signAndExecuteTransaction: signAndExecuteTransaction,
    userAddress: alice.address,
    onProgress: (step, percent) => {
      console.log(`${step}: ${percent}%`);
      // UI shows:
      // "fetching-namespace: 10%"
      // "encrypting: 20%"
      // "encoding: 40%"
      // "registering: 50%"
      // "uploading-shards: 70%"
      // "certifying: 90%"
      // "complete: 100%"
    },
  });

  console.log("Encrypted blob uploaded:", result.blobId);
  // result = {
  //   blobId: "0x789abc...",
  //   encryptedObjectMetadata: {
  //     kemType: 0,
  //     demType: 0,
  //     threshold: 2
  //   }
  // }

  return result;
}
```

**What happens inside `publishEncryptedDataset()`:**

```typescript
// INTERNAL EXECUTION (you don't write this, it's in seal-walrus.ts)

// Step A: Get allowlist namespace
const namespaceBytes = await getAllowlistNamespace("0xabc123...");
// namespaceBytes = [0xab, 0xc1, 0x23, ...] (32 bytes)

// Step B: Construct Seal ID
const sealId = "abc123...::weather-2024"; // namespace hex + "::" + datasetId

// Step C: Encrypt with Seal
const fileBytes = new Uint8Array(await file.arrayBuffer()); // 50MB
const { encryptedObject, key } = await sealClient.encrypt({
  threshold: 2, // Need 2 key servers
  packageId: MARKETPLACE_PACKAGE_ID,
  id: sealId,
  data: fileBytes,
  demType: DemType.AesGcm256,
});
// encryptedObject = encrypted 50MB blob
// key = symmetric key (BACKUP ONLY, never share)

// Step D: Upload to Walrus
const flow = walrusClient.writeBlobFlow({ blob: encryptedObject });
await flow.encode(); // WASM encoding
const tx1 = flow.register({ epochs: 100, owner: alice.address, deletable: true });
const txResult1 = await signAndExecuteTransaction({ transaction: tx1 });
await flow.upload({ digest: txResult1.digest }); // Upload shards to storage nodes
const tx2 = flow.certify();
await signAndExecuteTransaction({ transaction: tx2 });
const blobResult = await flow.getBlob();
// blobResult.blobId = "0x789abc..."
```

**Result**:
- ✅ File encrypted with Seal (only allowlist members can decrypt)
- ✅ Encrypted blob stored on Walrus: `0x789abc...`
- ✅ Alice has backup symmetric key (for disaster recovery)

---

### Step 1.3: Alice Publishes Dataset to Marketplace

```typescript
// In: frontend/components/Publish/DeployProgress.tsx
// After upload completes

async function publishToMarketplace() {
  const tx = new Transaction();

  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::marketplace::publish_dataset_entry`,
    arguments: [
      tx.pure.string("Premium Weather Data 2024"),
      tx.pure.string("50,000+ weather stations, hourly updates"),
      tx.object(allowlistId), // 0xabc123...
      tx.object(capId), // 0xdef456... (proves Alice owns allowlist)
      tx.pure.string(result.blobId), // "0x789abc..."
      tx.pure.u64(100_000_000_000), // 100 SUI (in MIST)
      tx.pure.u64(2), // seal_threshold
      tx.pure.u64(0), // seal_kem_type
      tx.pure.u64(0), // seal_dem_type
    ],
  });

  const publishResult = await signAndExecuteTransaction({ transaction: tx });

  const dataset = publishResult.effects?.created?.find(obj =>
    obj.type.includes('::marketplace::Dataset')
  );

  console.log("Dataset published:", dataset.objectId);
  return dataset.objectId; // "0xdataset123..."
}
```

**Result**:
- ✅ Dataset object created: `0xdataset123...`
- ✅ Listed on marketplace for 100 SUI
- ✅ Blob `0x789abc...` attached to allowlist `0xabc123...`

---

## 🟢 PHASE 2: Bob Purchases Dataset (Buyer 1)

### Step 2.1: Bob Browses Marketplace

```typescript
// In: frontend/app/marketplace/page.tsx
// Bob visits marketplace, sees Alice's dataset

const datasets = await suiClient.getObject({
  id: "0xdataset123...",
  options: { showContent: true }
});

// Bob sees:
// {
//   title: "Premium Weather Data 2024",
//   price: 100 SUI,
//   seller: "0xalice...",
//   allowlist_id: "0xabc123...",
//   walrus_blob_id: "0x789abc...",
//   sales_count: 0
// }
```

---

### Step 2.2: Bob Purchases Access

```typescript
// In: frontend/components/ItemDetail/PaymentModal.tsx
// When Bob clicks "Purchase for 100 SUI"

async function purchaseDataset() {
  const tx = new Transaction();

  // Split 100 SUI from gas coin
  const [payment] = tx.splitCoins(tx.gas, [100_000_000_000]);

  tx.moveCall({
    target: `${MARKETPLACE_PACKAGE_ID}::marketplace::purchase_dataset_entry`,
    arguments: [
      tx.object("0xdataset123..."), // Dataset
      tx.object("0xabc123..."), // Allowlist
      tx.object("0xdef456..."), // Cap (Alice must pass this to marketplace contract)
      payment, // 100 SUI
    ],
  });

  const result = await signAndExecuteTransaction({ transaction: tx });

  // Events emitted:
  // Purchase {
  //   dataset_id: "0xdataset123...",
  //   buyer: "0xbob...",
  //   seller: "0xalice...",
  //   price: 100_000_000_000
  // }

  console.log("Purchase successful!");
}
```

**What happens on-chain:**

```move
// In marketplace::purchase_dataset()

// 1. Verify payment ≥ 100 SUI ✓
// 2. Transfer 100 SUI to Alice ✓
// 3. Add Bob to allowlist:
allowlist::add(allowlist, cap, bob_address);
// Now allowlist.list = [bob_address]

// 4. Increment sales_count ✓
// 5. Emit Purchase event ✓
```

**Result**:
- ✅ Bob paid 100 SUI → Alice receives it
- ✅ Bob's address added to allowlist: `[0xbob...]`
- ✅ Bob can now decrypt the dataset

---

### Step 2.3: Bob Downloads & Decrypts Dataset

```typescript
// In: frontend/components/ItemDetail/PaymentModal.tsx
// After purchase, Bob clicks "Download"

import { SealWalrusService } from '@/lib/seal-walrus';

const service = new SealWalrusService();

async function downloadDataset() {
  const blob = await service.downloadAndDecryptDataset({
    blobId: "0x789abc...",
    allowlistId: "0xabc123...",
    datasetId: "weather-2024",
    buyerAddress: bob.address,
    signAndExecuteTransaction: signAndExecuteTransaction,
    signPersonalMessage: async (msg) => {
      // Wallet-specific signing
      return await wallet.signPersonalMessage(msg);
    },
    onProgress: (step, percent) => {
      console.log(`${step}: ${percent}%`);
      // UI shows:
      // "fetching-namespace: 5%"
      // "creating-session: 10%"
      // "signing-session: 15%"
      // "creating-approval: 20%"
      // "fetching-keys: 30%"
      // "downloading: 50%"
      // "decrypting: 80%"
      // "complete: 100%"
    },
  });

  // blob = 50MB decrypted file
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'weather-2024.csv';
  a.click();

  console.log("File downloaded successfully!");
}
```

**What happens inside `downloadAndDecryptDataset()`:**

```typescript
// INTERNAL EXECUTION

// Step A: Get namespace
const namespace = await getAllowlistNamespace("0xabc123...");
const sealId = "abc123...::weather-2024";

// Step B: Create SessionKey (ephemeral key for this download session)
const sessionKey = await SessionKey.create({
  address: bob.address,
  packageId: SEAL_PACKAGE_ID,
  ttlMin: 30, // Valid for 30 minutes
  suiClient: suiClient,
});

// Step C: Sign personal message (proves Bob controls the wallet)
const personalMessage = sessionKey.getPersonalMessage();
// personalMessage = "Approve Seal session for 30 minutes..."
const { signature } = await signPersonalMessage({ message: personalMessage });
await sessionKey.setPersonalMessageSignature(signature);

// Step D: Build approval transaction (this proves Bob can access the data)
const approvalTx = new Transaction();
approvalTx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::allowlist::seal_approve`,
  arguments: [
    approvalTx.pure.vector('u8', Array.from(Buffer.from(sealId, 'utf-8'))),
    approvalTx.object("0xabc123..."),
  ],
});
const approvalTxBytes = await approvalTx.build({ client: suiClient });

// Step E: Fetch decryption keys from Seal key servers
// Key servers will:
// 1. Simulate approvalTx
// 2. Verify seal_approve() succeeds (Bob is in allowlist)
// 3. Return key shares if approved
await sealClient.fetchKeys({
  ids: [sealId],
  txBytes: approvalTxBytes,
  sessionKey: sessionKey,
  threshold: 2, // Need 2 out of N servers
});

console.log("✓ Key servers approved access");

// Step F: Download encrypted blob from Walrus
const encryptedBlob = await walrusClient.readBlob({
  blobId: "0x789abc..."
});
// encryptedBlob = 50MB encrypted data

// Step G: Decrypt with Seal
const encryptedData = new Uint8Array(await encryptedBlob.arrayBuffer());
const decryptedData = await sealClient.decrypt({
  data: encryptedData,
  sessionKey: sessionKey,
  txBytes: approvalTxBytes,
  checkShareConsistency: true, // Verify key shares are consistent
});

// decryptedData = original 50MB CSV file!
return new Blob([decryptedData]);
```

**Key Server Validation Flow:**

```
Bob's Request → Seal Key Server 1
                ↓
                Simulates: seal_approve(id="abc123...::weather-2024", allowlist="0xabc123...", ctx)
                ↓
                Checks: is_prefix("abc123...", "abc123...::weather-2024") ✓
                        allowlist.list.contains(bob.address) ✓
                ↓
                Returns: Key Share 1

Bob's Request → Seal Key Server 2
                ↓
                Same validation
                ↓
                Returns: Key Share 2

Combine Key Share 1 + Key Share 2 → Decrypt File ✓
```

**Result**:
- ✅ Seal key servers verified Bob is in allowlist
- ✅ Decryption keys fetched
- ✅ Bob downloads original 50MB CSV file

---

## 🟣 PHASE 3: Carol Purchases Dataset (Buyer 2)

### Step 3.1: Carol Purchases

```typescript
// Same as Bob's purchase (Step 2.2)
const tx = new Transaction();
const [payment] = tx.splitCoins(tx.gas, [100_000_000_000]);
tx.moveCall({
  target: `${MARKETPLACE_PACKAGE_ID}::marketplace::purchase_dataset_entry`,
  arguments: [
    tx.object("0xdataset123..."),
    tx.object("0xabc123..."),
    tx.object("0xdef456..."),
    payment,
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

**On-chain state update:**

```move
// allowlist.list = [bob_address, carol_address]
// dataset.sales_count = 2
```

**Result**:
- ✅ Carol paid 100 SUI → Alice receives it
- ✅ Allowlist now: `[0xbob..., 0xcarol...]`
- ✅ Carol can decrypt the dataset

---

### Step 3.2: Carol Downloads & Decrypts

```typescript
// Identical to Bob's download (Step 2.3)
const blob = await service.downloadAndDecryptDataset({
  blobId: "0x789abc...",
  allowlistId: "0xabc123...",
  datasetId: "weather-2024",
  buyerAddress: carol.address, // Different address
  signAndExecuteTransaction: signAndExecuteTransaction,
  signPersonalMessage: signPersonalMessage,
  onProgress: (step, percent) => console.log(`${step}: ${percent}%`),
});

// Carol gets the same 50MB CSV file ✓
```

**Key difference in validation:**

```
Carol's Request → Seal Key Server
                  ↓
                  Checks: allowlist.list.contains(carol.address) ✓
                  ↓
                  Returns: Key Shares for Carol
```

**Result**:
- ✅ Carol successfully decrypts and downloads the file
- ✅ Same encrypted blob, different buyer, works perfectly

---

## 📊 Final State

### On-Chain Data:

```javascript
Dataset {
  id: "0xdataset123...",
  title: "Premium Weather Data 2024",
  allowlist_id: "0xabc123...",
  walrus_blob_id: "0x789abc...",
  price: 100 SUI,
  seller: "0xalice...",
  sales_count: 2,
}

Allowlist {
  id: "0xabc123...",
  list: [
    "0xbob...",
    "0xcarol...",
  ],
  // Dynamic field: "0x789abc..." → MARKER
}

Alice's wallet: +200 SUI (from Bob and Carol)
Bob's wallet: -100 SUI, has decrypted file ✓
Carol's wallet: -100 SUI, has decrypted file ✓
```

### Walrus Storage:

```
BlobID: 0x789abc...
Size: 50MB (encrypted)
Owner: Alice
Expires: Epoch 100
Status: Certified ✓
```

---

## 🔒 Security Guarantees

### ✅ What Works:

1. **Encryption**: File encrypted client-side before leaving Alice's browser
2. **Access Control**: Only allowlist members can decrypt
3. **Decentralization**: No central key server (threshold of 2 required)
4. **Privacy**: Walrus stores encrypted blob, can't read contents
5. **Payment**: Automatic - purchase adds to allowlist atomically

### ❌ What Can't Be Prevented:

1. **Resharing**: Bob can share decrypted file with others (physical DRM impossible)
2. **Refunds**: No automatic refund mechanism
3. **Revocation**: Once in allowlist, buyer keeps access (unless removed by Cap owner)

---

## 🎯 Summary of Code Entry Points

### Alice (Seller):
```typescript
// 1. Create allowlist
createAllowlist() → allowlistId, capId

// 2. Publish encrypted dataset
service.publishEncryptedDataset({
  file, allowlistId, datasetId, ...
}) → blobId, metadata

// 3. List on marketplace
publishToMarketplace() → datasetId
```

### Bob/Carol (Buyers):
```typescript
// 1. Purchase
purchaseDataset() → Payment sent, added to allowlist

// 2. Download & decrypt
service.downloadAndDecryptDataset({
  blobId, allowlistId, datasetId, ...
}) → Decrypted file blob
```

---

## 📝 Code Files Referenced

- **`frontend/lib/seal-walrus.ts`**: `SealWalrusService` class
- **`frontend/hooks/useSealWalrus.ts`**: React hook wrapper
- **`frontend/components/Publish/PublishWizard.tsx`**: Alice's publish UI
- **`frontend/components/ItemDetail/PaymentModal.tsx`**: Bob/Carol's purchase UI
- **`contract/sources/allowlist.move`**: Access control logic
- **`contract/sources/marketplace.move`**: Dataset & purchase logic

---

This is the complete flow from Alice publishing encrypted data to multiple buyers downloading it! 🚀
