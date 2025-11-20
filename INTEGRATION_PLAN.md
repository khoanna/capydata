# Seal + Walrus Integration Plan

## Architecture Overview

### Data Flow

```
SELLER: File → Seal.encrypt(namespace+id) → Walrus.upload(encrypted) → Allowlist.publish(blobId)
BUYER: Purchase → Allowlist.add(buyer) → SessionKey → seal_approve(namespace+id) → Seal.decrypt → Download
```

### Key Components

1. **Allowlist Contract** (already implemented)
   - Manages access control per dataset
   - `seal_approve(id, allowlist, ctx)` validates namespace + caller
   - `namespace(allowlist)` returns unique prefix

2. **Seal Identity Format**
   ```
   id = hex(allowlist.id.to_bytes()) + "::" + dataset_id
   ```

3. **Walrus Storage**
   - Stores encrypted blobs
   - Uses blob flow pattern (encode → register → upload → certify)

---

## Implementation Files

### 1. `frontend/lib/seal-walrus.ts`

Core service integrating Seal encryption with Walrus storage.

```typescript
import { seal, SealClient, SessionKey, DemType } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import walrusWasmUrl from '@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url';

// Configuration
const SEAL_PACKAGE_ID = '0x...'; // Your Seal package ID
const MARKETPLACE_PACKAGE_ID = '0x...'; // Your marketplace package ID
const EPOCHS = 100; // Storage duration

// Seal key server configurations (get from https://seal-docs.wal.app/)
const SEAL_KEY_SERVERS = [
  {
    objectId: '0x...', // Testnet key server 1
    weight: 1,
  },
  {
    objectId: '0x...', // Testnet key server 2
    weight: 1,
  },
];

export class SealWalrusService {
  private sealClient: SealClient;
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;

  constructor() {
    // Initialize Sui client
    this.suiClient = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });

    // Initialize Seal client
    const sealExtension = seal({
      serverConfigs: SEAL_KEY_SERVERS,
      verifyKeyServers: true,
      timeout: 30000,
    });
    this.sealClient = sealExtension.register(this.suiClient as any);

    // Initialize Walrus client
    this.walrusClient = new WalrusClient({
      network: 'testnet',
      suiRpcUrl: getFullnodeUrl('testnet'),
      wasmUrl: walrusWasmUrl,
    });
  }

  /**
   * SELLER SIDE: Encrypt file and upload to Walrus
   */
  async publishEncryptedDataset(params: {
    file: File;
    allowlistId: string; // The allowlist object ID
    datasetId: string; // Unique identifier for this dataset
    signAndExecuteTransaction: (input: any) => Promise<any>;
    userAddress: string;
    onProgress?: (step: string, progress: number) => void;
  }): Promise<{
    blobId: string;
    encryptedObjectMetadata: {
      kemType: number;
      demType: number;
      threshold: number;
    };
  }> {
    const { file, allowlistId, datasetId, signAndExecuteTransaction, userAddress, onProgress } = params;

    try {
      // Step 1: Get allowlist namespace
      onProgress?.('fetching-namespace', 10);
      const namespace = await this.getAllowlistNamespace(allowlistId);
      console.log('Allowlist namespace:', Buffer.from(namespace).toString('hex'));

      // Step 2: Construct Seal identity (namespace + dataset ID)
      const sealId = this.constructSealId(namespace, datasetId);
      console.log('Seal ID:', sealId);

      // Step 3: Encrypt file with Seal
      onProgress?.('encrypting', 20);
      const fileData = new Uint8Array(await file.arrayBuffer());

      const { encryptedObject, key } = await this.sealClient.encrypt({
        threshold: 2, // Need 2 out of N key servers
        packageId: MARKETPLACE_PACKAGE_ID,
        id: sealId,
        data: fileData,
        demType: DemType.AesGcm256,
      });

      console.log('File encrypted successfully');
      console.log('Encrypted size:', encryptedObject.length, 'bytes');
      console.log('WARNING: Symmetric key should be backed up securely (not shared publicly)');

      // Step 4: Upload encrypted blob to Walrus
      onProgress?.('uploading', 40);
      const blobId = await this.uploadToWalrus({
        data: encryptedObject,
        signAndExecuteTransaction,
        userAddress,
        onProgress: (step, subProgress) => {
          onProgress?.(step, 40 + (subProgress * 0.5)); // 40-90%
        },
      });

      onProgress?.('complete', 100);

      return {
        blobId,
        encryptedObjectMetadata: {
          kemType: 0, // BonehFranklinBLS12381DemCCA
          demType: 0, // AesGcm256
          threshold: 2,
        },
      };
    } catch (error) {
      console.error('Error publishing encrypted dataset:', error);
      throw error;
    }
  }

  /**
   * BUYER SIDE: Download and decrypt dataset
   */
  async downloadAndDecryptDataset(params: {
    blobId: string;
    allowlistId: string;
    datasetId: string;
    buyerAddress: string;
    signAndExecuteTransaction: (input: any) => Promise<any>;
    signPersonalMessage: (message: { message: Uint8Array }) => Promise<{ signature: string }>;
    onProgress?: (step: string, progress: number) => void;
  }): Promise<Blob> {
    const { blobId, allowlistId, datasetId, buyerAddress, signAndExecuteTransaction, signPersonalMessage, onProgress } = params;

    try {
      // Step 1: Get allowlist namespace
      onProgress?.('fetching-namespace', 5);
      const namespace = await this.getAllowlistNamespace(allowlistId);
      const sealId = this.constructSealId(namespace, datasetId);

      // Step 2: Create SessionKey
      onProgress?.('creating-session', 10);
      const sessionKey = await SessionKey.create({
        address: buyerAddress,
        packageId: SEAL_PACKAGE_ID,
        ttlMin: 30, // 30 minute session
        suiClient: this.suiClient as any,
      });

      // Step 3: Sign personal message for session key
      onProgress?.('signing-session', 15);
      const personalMessage = sessionKey.getPersonalMessage();
      const { signature } = await signPersonalMessage({ message: personalMessage });
      await sessionKey.setPersonalMessageSignature(signature);

      // Step 4: Create approval transaction (calls seal_approve)
      onProgress?.('creating-approval', 20);
      const approvalTx = new Transaction();
      approvalTx.moveCall({
        target: `${MARKETPLACE_PACKAGE_ID}::allowlist::seal_approve`,
        arguments: [
          approvalTx.pure.vector('u8', Array.from(Buffer.from(sealId, 'utf-8'))),
          approvalTx.object(allowlistId),
        ],
      });

      const approvalTxBytes = await approvalTx.build({ client: this.suiClient });

      // Step 5: Fetch decryption keys from Seal key servers
      onProgress?.('fetching-keys', 30);
      await this.sealClient.fetchKeys({
        ids: [sealId],
        txBytes: approvalTxBytes,
        sessionKey: sessionKey,
        threshold: 2,
      });

      console.log('Decryption keys fetched from Seal key servers');

      // Step 6: Download encrypted blob from Walrus
      onProgress?.('downloading', 50);
      const encryptedBlob = await this.downloadFromWalrus(blobId);

      // Step 7: Decrypt with Seal
      onProgress?.('decrypting', 80);
      const encryptedData = new Uint8Array(await encryptedBlob.arrayBuffer());

      const decryptedData = await this.sealClient.decrypt({
        data: encryptedData,
        sessionKey: sessionKey,
        txBytes: approvalTxBytes,
        checkShareConsistency: true,
      });

      console.log('Decryption successful');
      console.log('Decrypted size:', decryptedData.length, 'bytes');

      onProgress?.('complete', 100);

      // Return as Blob
      return new Blob([decryptedData]);
    } catch (error) {
      console.error('Error downloading and decrypting dataset:', error);
      throw error;
    }
  }

  /**
   * Upload encrypted data to Walrus (using your working code pattern)
   */
  private async uploadToWalrus(params: {
    data: Uint8Array;
    signAndExecuteTransaction: (input: any) => Promise<any>;
    userAddress: string;
    onProgress?: (step: string, progress: number) => void;
  }): Promise<string> {
    const { data, signAndExecuteTransaction, userAddress, onProgress } = params;

    // Normalize user address
    const normalizedAddress = userAddress.startsWith('0x') ? userAddress : `0x${userAddress}`;

    // Step 1: Create blob upload flow
    onProgress?.('encoding', 10);
    const flow = this.walrusClient.writeBlobFlow({
      blob: data,
    });

    // Step 2: Encode the blob
    await flow.encode();

    // Step 3: Create registration transaction
    onProgress?.('registering', 30);
    const tx = flow.register({
      epochs: EPOCHS,
      owner: normalizedAddress,
      deletable: true,
    });

    // Step 4: Sign and execute
    const txResult = await signAndExecuteTransaction({
      transaction: tx,
    });

    if (!txResult.digest) {
      throw new Error('No transaction digest returned');
    }

    // Step 5: Upload to storage nodes
    onProgress?.('uploading-shards', 60);
    await flow.upload({ digest: txResult.digest });

    // Step 6: Certify
    onProgress?.('certifying', 90);
    const certifyTransaction = flow.certify();
    await signAndExecuteTransaction({ transaction: certifyTransaction });

    // Get blob ID
    const blobResult = await flow.getBlob();
    if (!blobResult.blobId) {
      throw new Error('Failed to get blob ID from upload');
    }

    console.log('Blob uploaded successfully:', blobResult.blobId);
    return blobResult.blobId;
  }

  /**
   * Download blob from Walrus (using your working code)
   */
  private async downloadFromWalrus(blobId: string): Promise<Blob> {
    console.log('Downloading blob from Walrus:', blobId);

    const fileData = await this.walrusClient.readBlob({ blobId });

    console.log('Downloaded blob size:', fileData.length, 'bytes');
    return new Blob([new Uint8Array(fileData)]);
  }

  /**
   * Get allowlist namespace from on-chain object
   */
  private async getAllowlistNamespace(allowlistId: string): Promise<Uint8Array> {
    // The namespace is the UID bytes of the allowlist object
    // In Move: allowlist.id.to_bytes()
    // We need to extract the id field from the allowlist object

    const allowlistObject = await this.suiClient.getObject({
      id: allowlistId,
      options: {
        showContent: true,
      },
    });

    if (!allowlistObject.data?.content || allowlistObject.data.content.dataType !== 'moveObject') {
      throw new Error('Invalid allowlist object');
    }

    // The UID is the object ID itself when converted to bytes
    // In Sui, object::id() returns the UID's inner ID
    const idBytes = Buffer.from(allowlistId.replace('0x', ''), 'hex');

    return new Uint8Array(idBytes);
  }

  /**
   * Construct Seal ID from namespace and dataset ID
   */
  private constructSealId(namespace: Uint8Array, datasetId: string): string {
    // Format: hex(namespace) + "::" + datasetId
    const namespaceHex = Buffer.from(namespace).toString('hex');
    return `${namespaceHex}::${datasetId}`;
  }
}
```

---

### 2. `frontend/hooks/useSealWalrus.ts`

React hook for UI components.

```typescript
import { useState } from 'react';
import { SealWalrusService } from '@/lib/seal-walrus';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';

export function useSealWalrus() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ step: '', percent: 0 });
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const service = new SealWalrusService();

  const publishDataset = async (params: {
    file: File;
    allowlistId: string;
    datasetId: string;
  }) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await service.publishEncryptedDataset({
        ...params,
        signAndExecuteTransaction,
        userAddress: currentAccount.address,
        onProgress: (step, percent) => {
          setProgress({ step, percent });
        },
      });

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDataset = async (params: {
    blobId: string;
    allowlistId: string;
    datasetId: string;
  }) => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const signPersonalMessage = async (message: { message: Uint8Array }) => {
        // TODO: Implement wallet's signPersonalMessage
        // This is wallet-specific - for Sui wallets
        throw new Error('signPersonalMessage not implemented');
      };

      const blob = await service.downloadAndDecryptDataset({
        ...params,
        buyerAddress: currentAccount.address,
        signAndExecuteTransaction,
        signPersonalMessage,
        onProgress: (step, percent) => {
          setProgress({ step, percent });
        },
      });

      return blob;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    publishDataset,
    downloadDataset,
    isLoading,
    progress,
    error,
  };
}
```

---

### 3. `contract/sources/marketplace.move`

Extended marketplace contract.

```move
module 0x0::marketplace;

use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::event;
use 0x0::allowlist::{Self, Allowlist, Cap};

// Errors
const EInsufficientPayment: u64 = 0;
const ENotOwner: u64 = 1;

// Structs
public struct Dataset has key, store {
    id: UID,
    title: String,
    description: String,
    allowlist_id: ID,
    walrus_blob_id: String,
    price: u64,
    seller: address,
    sales_count: u64,
    created_at: u64,
    // Seal encryption metadata
    seal_threshold: u64,
    seal_kem_type: u64,
    seal_dem_type: u64,
}

public struct Purchase has copy, drop {
    dataset_id: ID,
    buyer: address,
    seller: address,
    price: u64,
}

// Create and publish a new encrypted dataset
public fun publish_dataset(
    title: String,
    description: String,
    allowlist: &Allowlist,
    cap: &Cap,
    walrus_blob_id: String,
    price: u64,
    seal_threshold: u64,
    seal_kem_type: u64,
    seal_dem_type: u64,
    ctx: &mut TxContext
): Dataset {
    let dataset = Dataset {
        id: object::new(ctx),
        title,
        description,
        allowlist_id: object::id(allowlist),
        walrus_blob_id: walrus_blob_id,
        price,
        seller: ctx.sender(),
        sales_count: 0,
        created_at: ctx.epoch(),
        seal_threshold,
        seal_kem_type,
        seal_dem_type,
    };

    // Attach blob to allowlist
    allowlist::publish(allowlist, cap, walrus_blob_id);

    dataset
}

entry fun publish_dataset_entry(
    title: String,
    description: String,
    allowlist: &mut Allowlist,
    cap: &Cap,
    walrus_blob_id: String,
    price: u64,
    seal_threshold: u64,
    seal_kem_type: u64,
    seal_dem_type: u64,
    ctx: &mut TxContext
) {
    let dataset = publish_dataset(
        title,
        description,
        allowlist,
        cap,
        walrus_blob_id,
        price,
        seal_threshold,
        seal_kem_type,
        seal_dem_type,
        ctx
    );
    transfer::share_object(dataset);
}

// Purchase dataset and get added to allowlist
public fun purchase_dataset(
    dataset: &mut Dataset,
    allowlist: &mut Allowlist,
    cap: &Cap,
    payment: Coin<SUI>,
    ctx: &mut TxContext
) {
    // Verify payment
    assert!(coin::value(&payment) >= dataset.price, EInsufficientPayment);

    let buyer = ctx.sender();

    // Transfer payment to seller
    transfer::public_transfer(payment, dataset.seller);

    // Add buyer to allowlist (grants decryption permission)
    allowlist::add(allowlist, cap, buyer);

    // Update stats
    dataset.sales_count = dataset.sales_count + 1;

    // Emit event
    event::emit(Purchase {
        dataset_id: object::id(dataset),
        buyer,
        seller: dataset.seller,
        price: dataset.price,
    });
}

entry fun purchase_dataset_entry(
    dataset: &mut Dataset,
    allowlist: &mut Allowlist,
    cap: &Cap,
    payment: Coin<SUI>,
    ctx: &mut TxContext
) {
    purchase_dataset(dataset, allowlist, cap, payment, ctx);
}

// Getters
public fun get_allowlist_id(dataset: &Dataset): ID {
    dataset.allowlist_id
}

public fun get_blob_id(dataset: &Dataset): String {
    dataset.walrus_blob_id
}

public fun get_price(dataset: &Dataset): u64 {
    dataset.price
}
```

---

## Testing Checklist

- [ ] Allowlist namespace extraction works correctly
- [ ] Seal ID format matches Move contract expectations
- [ ] Encryption produces valid encrypted objects
- [ ] Walrus upload completes all steps (register → upload → certify)
- [ ] Purchase adds buyer to allowlist
- [ ] SessionKey creation and signing works
- [ ] `seal_approve` transaction builds correctly
- [ ] Seal key servers return decryption keys
- [ ] Walrus download retrieves correct blob
- [ ] Decryption produces original file

---

## Security Considerations

1. **Never expose symmetric keys** - The `key` returned from `encrypt()` should only be backed up securely, never shared
2. **SessionKey TTL** - Maximum 30 minutes, store in browser's IndexedDB
3. **Allowlist management** - Only Cap holder can add/remove addresses
4. **Namespace prefix validation** - Prevents cross-allowlist access
5. **Transaction approval** - Seal key servers verify `seal_approve` was called successfully

---

## Next Steps

1. Get Seal testnet key server object IDs from https://seal-docs.wal.app/
2. Deploy allowlist and marketplace contracts
3. Test full flow: publish → purchase → decrypt
4. Implement UI components using `useSealWalrus` hook
5. Add error handling and retry logic
