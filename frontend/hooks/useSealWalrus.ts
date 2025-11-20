/**
 * React hook for Seal + Walrus operations
 * Provides easy-to-use interface for encrypting, uploading, and decrypting data
 */

import { useState } from 'react';
import { SealWalrusService, PublishResult } from '@/lib/seal-walrus';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

export interface ProgressState {
  step: string;
  percent: number;
  message?: string;
}

export function useSealWalrus() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ step: '', percent: 0 });
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  /**
   * Publish encrypted dataset (for sellers)
   */
  const publishDataset = async (params: {
    file: File;
    allowlistId: string;
    datasetId: string;
  }): Promise<PublishResult> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setProgress({ step: 'starting', percent: 0 });

    try {
      const service = new SealWalrusService();

      const result = await service.publishEncryptedDataset({
        ...params,
        signAndExecuteTransaction,
        userAddress: currentAccount.address,
        onProgress: (step, percent) => {
          setProgress({
            step,
            percent,
            message: getProgressMessage(step),
          });
        },
      });

      setProgress({ step: 'complete', percent: 100, message: 'Dataset published successfully' });
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Download and decrypt dataset (for buyers)
   */
  const downloadDataset = async (params: {
    blobId: string;
    allowlistId: string;
    datasetId: string;
  }): Promise<Blob> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setProgress({ step: 'starting', percent: 0 });

    try {
      const service = new SealWalrusService();

      // TODO: Implement wallet-specific signPersonalMessage
      // This is currently a placeholder - needs actual wallet integration
      const signPersonalMessage = async (message: { message: Uint8Array }) => {
        // For Sui Wallet, you might use:
        // return await wallet.signPersonalMessage(message);

        // For now, throw error to remind us to implement this
        throw new Error('signPersonalMessage not yet implemented for this wallet. Please add wallet-specific signing logic.');
      };

      const blob = await service.downloadAndDecryptDataset({
        ...params,
        buyerAddress: currentAccount.address,
        signAndExecuteTransaction,
        signPersonalMessage,
        onProgress: (step, percent) => {
          setProgress({
            step,
            percent,
            message: getProgressMessage(step),
          });
        },
      });

      setProgress({ step: 'complete', percent: 100, message: 'Dataset decrypted successfully' });
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
    clearError: () => setError(null),
  };
}

/**
 * Get user-friendly message for each progress step
 */
function getProgressMessage(step: string): string {
  const messages: Record<string, string> = {
    'starting': 'Initializing...',
    'fetching-namespace': 'Loading allowlist data...',
    'encrypting': 'Encrypting your file with Seal...',
    'encoding': 'Encoding for Walrus storage...',
    'registering': 'Registering blob on-chain...',
    'uploading-shards': 'Uploading to decentralized storage...',
    'certifying': 'Certifying blob availability...',
    'creating-session': 'Creating decryption session...',
    'signing-session': 'Requesting signature...',
    'creating-approval': 'Creating access approval...',
    'fetching-keys': 'Fetching decryption keys...',
    'downloading': 'Downloading encrypted data...',
    'decrypting': 'Decrypting with Seal...',
    'complete': 'Complete!',
  };

  return messages[step] || step;
}
