/**
 * Seal + Walrus Integration Service
 * Handles encryption, decryption, and decentralized storage
 */

import { seal, SealClient, SessionKey, DemType } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import walrusWasmUrl from '@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url';
import { config } from './config';

export interface PublishResult {
  blobId: string;
  encryptedObjectMetadata: {
    kemType: number;
    demType: number;
    threshold: number;
  };
}

export interface ProgressCallback {
  (step: string, percent: number): void;
}

export class SealWalrusService {
  private sealClient: SealClient;
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;

  constructor() {
    // Initialize Sui client
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(config.network),
    });

    // Initialize Seal client
    if (config.sealKeyServers.length === 0) {
      throw new Error('Seal key servers not configured. Please set NEXT_PUBLIC_SEAL_KEY_SERVERS');
    }

    const sealExtension = seal({
      serverConfigs: config.sealKeyServers,
      verifyKeyServers: true,
      timeout: 30000,
    });
    this.sealClient = sealExtension.register(this.suiClient as any);

    // Initialize Walrus client
    this.walrusClient = new WalrusClient({
      network: config.network,
      suiRpcUrl: getFullnodeUrl(config.network),
      wasmUrl: walrusWasmUrl,
    });
  }

  /**
   * SELLER SIDE: Encrypt file and upload to Walrus
   */
  async publishEncryptedDataset(params: {
    file: File;
    allowlistId: string;
    datasetId: string;
    signAndExecuteTransaction: (input: any) => Promise<any>;
    userAddress: string;
    onProgress?: ProgressCallback;
  }): Promise<PublishResult> {
    const { file, allowlistId, datasetId, signAndExecuteTransaction, userAddress, onProgress } = params;

    try {
      // Step 1: Get allowlist namespace
      onProgress?.('fetching-namespace', 10);
      const namespace = await this.getAllowlistNamespace(allowlistId);
      console.log('[Seal] Allowlist namespace:', Buffer.from(namespace).toString('hex'));

      // Step 2: Construct Seal identity (namespace + dataset ID)
      const sealId = this.constructSealId(namespace, datasetId);
      console.log('[Seal] Encryption ID:', sealId);

      // Step 3: Encrypt file with Seal
      onProgress?.('encrypting', 20);
      const fileData = new Uint8Array(await file.arrayBuffer());
      console.log('[Seal] Encrypting file:', file.name, `(${fileData.length} bytes)`);

      const { encryptedObject, key } = await this.sealClient.encrypt({
        threshold: 2,
        packageId: config.marketplacePackageId,
        id: sealId,
        data: fileData,
        demType: DemType.AesGcm256,
      });

      console.log('[Seal] ✓ File encrypted successfully');
      console.log('[Seal] Encrypted size:', encryptedObject.length, 'bytes');
      console.log('[Seal] ⚠️  Symmetric key generated (for backup only, DO NOT SHARE)');

      // Step 4: Upload encrypted blob to Walrus
      onProgress?.('uploading', 40);
      const blobId = await this.uploadToWalrus({
        data: encryptedObject,
        signAndExecuteTransaction,
        userAddress,
        onProgress: (step, subProgress) => {
          onProgress?.(step, 40 + subProgress * 0.5);
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
      console.error('[Seal] Error publishing encrypted dataset:', error);
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
    onProgress?: ProgressCallback;
  }): Promise<Blob> {
    const { blobId, allowlistId, datasetId, buyerAddress, signAndExecuteTransaction, signPersonalMessage, onProgress } = params;

    try {
      // Step 1: Get allowlist namespace
      onProgress?.('fetching-namespace', 5);
      const namespace = await this.getAllowlistNamespace(allowlistId);
      const sealId = this.constructSealId(namespace, datasetId);
      console.log('[Seal] Decryption ID:', sealId);

      // Step 2: Create SessionKey
      onProgress?.('creating-session', 10);
      console.log('[Seal] Creating session key...');
      const sessionKey = await SessionKey.create({
        address: buyerAddress,
        packageId: config.sealPackageId,
        ttlMin: 30,
        suiClient: this.suiClient as any,
      });

      // Step 3: Sign personal message for session key
      onProgress?.('signing-session', 15);
      const personalMessage = sessionKey.getPersonalMessage();
      console.log('[Seal] Requesting signature for session key...');
      const { signature } = await signPersonalMessage({ message: personalMessage });
      await sessionKey.setPersonalMessageSignature(signature);
      console.log('[Seal] ✓ Session key signed');

      // Step 4: Create approval transaction (calls seal_approve)
      onProgress?.('creating-approval', 20);
      const approvalTx = new Transaction();
      approvalTx.moveCall({
        target: `${config.marketplacePackageId}::allowlist::seal_approve`,
        arguments: [
          approvalTx.pure.vector('u8', Array.from(Buffer.from(sealId, 'utf-8'))),
          approvalTx.object(allowlistId),
        ],
      });

      const approvalTxBytes = await approvalTx.build({ client: this.suiClient });
      console.log('[Seal] ✓ Approval transaction created');

      // Step 5: Fetch decryption keys from Seal key servers
      onProgress?.('fetching-keys', 30);
      console.log('[Seal] Requesting decryption keys from key servers...');
      await this.sealClient.fetchKeys({
        ids: [sealId],
        txBytes: approvalTxBytes,
        sessionKey: sessionKey,
        threshold: 2,
      });

      console.log('[Seal] ✓ Decryption keys fetched from key servers');

      // Step 6: Download encrypted blob from Walrus
      onProgress?.('downloading', 50);
      console.log('[Walrus] Downloading encrypted blob:', blobId);
      const encryptedBlob = await this.downloadFromWalrus(blobId);

      // Step 7: Decrypt with Seal
      onProgress?.('decrypting', 80);
      const encryptedData = new Uint8Array(await encryptedBlob.arrayBuffer());
      console.log('[Seal] Decrypting data...', encryptedData.length, 'bytes');

      const decryptedData = await this.sealClient.decrypt({
        data: encryptedData,
        sessionKey: sessionKey,
        txBytes: approvalTxBytes,
        checkShareConsistency: true,
      });

      console.log('[Seal] ✓ Decryption successful');
      console.log('[Seal] Decrypted size:', decryptedData.length, 'bytes');

      onProgress?.('complete', 100);

      return new Blob([decryptedData]);
    } catch (error) {
      console.error('[Seal] Error downloading and decrypting dataset:', error);
      throw error;
    }
  }

  /**
   * Upload encrypted data to Walrus using blob flow pattern
   */
  private async uploadToWalrus(params: {
    data: Uint8Array;
    signAndExecuteTransaction: (input: any) => Promise<any>;
    userAddress: string;
    onProgress?: ProgressCallback;
  }): Promise<string> {
    const { data, signAndExecuteTransaction, userAddress, onProgress } = params;

    const normalizedAddress = userAddress.startsWith('0x') ? userAddress : `0x${userAddress}`;

    console.log('[Walrus] Starting upload flow...');

    // Step 1: Create blob upload flow
    onProgress?.('encoding', 10);
    const flow = this.walrusClient.writeBlobFlow({
      blob: data,
    });

    // Step 2: Encode the blob (WASM processing)
    console.log('[Walrus] Encoding blob...');
    await flow.encode();
    console.log('[Walrus] ✓ Blob encoded');

    // Step 3: Create registration transaction
    onProgress?.('registering', 30);
    console.log('[Walrus] Creating registration transaction...');
    const tx = flow.register({
      epochs: config.walrus.epochs,
      owner: normalizedAddress,
      deletable: true,
    });

    // Step 4: Sign and execute registration
    console.log('[Walrus] Signing registration transaction...');
    const txResult = await signAndExecuteTransaction({
      transaction: tx,
    });

    if (!txResult.digest) {
      throw new Error('No transaction digest returned from registration');
    }

    console.log('[Walrus] ✓ Registration transaction executed:', txResult.digest);

    // Step 5: Upload to storage nodes
    onProgress?.('uploading-shards', 60);
    console.log('[Walrus] Uploading shards to storage nodes...');
    await flow.upload({ digest: txResult.digest });
    console.log('[Walrus] ✓ Shards uploaded');

    // Step 6: Certify blob
    onProgress?.('certifying', 90);
    console.log('[Walrus] Certifying blob...');
    const certifyTransaction = flow.certify();
    await signAndExecuteTransaction({ transaction: certifyTransaction });
    console.log('[Walrus] ✓ Blob certified');

    // Get blob ID
    const blobResult = await flow.getBlob();
    if (!blobResult.blobId) {
      throw new Error('Failed to get blob ID from upload');
    }

    console.log('[Walrus] ✓ Upload complete. Blob ID:', blobResult.blobId);
    return blobResult.blobId;
  }

  /**
   * Download blob from Walrus
   */
  private async downloadFromWalrus(blobId: string): Promise<Blob> {
    console.log('[Walrus] Downloading blob:', blobId);

    const fileData = await this.walrusClient.readBlob({ blobId });

    console.log('[Walrus] ✓ Downloaded blob:', fileData.length, 'bytes');
    return new Blob([new Uint8Array(fileData)]);
  }

  /**
   * Get allowlist namespace from on-chain object
   */
  private async getAllowlistNamespace(allowlistId: string): Promise<Uint8Array> {
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
    const idBytes = Buffer.from(allowlistId.replace('0x', ''), 'hex');

    return new Uint8Array(idBytes);
  }

  /**
   * Construct Seal ID from namespace and dataset ID
   * Format: hex(namespace) + "::" + datasetId
   */
  private constructSealId(namespace: Uint8Array, datasetId: string): string {
    const namespaceHex = Buffer.from(namespace).toString('hex');
    return `${namespaceHex}::${datasetId}`;
  }
}
