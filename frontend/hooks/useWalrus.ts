"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {useEffect, useState} from "react";
import type {WalrusClient} from "@mysten/walrus";
import {log} from "console";

type WalrusModule = typeof import("@mysten/walrus");
type ExtendedSuiClient = ReturnType<typeof useSuiClient> & {
  walrus: WalrusClient;
};

let walrusModule: WalrusModule | null = null;

export default function useWalrus() {
  const [isReady, setIsReady] = useState(false);
  const suiClientBase = useSuiClient();
  const [suiClient, setSuiClient] = useState<ExtendedSuiClient | null>(null);
  const address = useCurrentAccount()?.address || "";
  const {mutateAsync: signAndExecuteTransaction} =
    useSignAndExecuteTransaction();

  useEffect(() => {
    if (typeof window !== "undefined" && !walrusModule) {
      import("@mysten/walrus")
        .then((module) => {
          walrusModule = module;
          const extended = suiClientBase.$extend(
            module.walrus({
              network: "testnet",
              storageNodeClientOptions: {
                onError: (error: Error) => console.log(error),
              },
            })
          );
          setSuiClient(extended as ExtendedSuiClient);
          setIsReady(true);
        })
        .catch((err) => {
          console.error("Failed to load Walrus SDK:", err);
        });
    } else if (walrusModule && !suiClient) {
      const extended = suiClientBase.$extend(
        walrusModule.walrus({
          network: "testnet",
          storageNodeClientOptions: {
            onError: (error: Error) => console.log(error),
          },
        })
      );
      setSuiClient(extended as ExtendedSuiClient);
      setIsReady(true);
    }
  }, [suiClientBase, suiClient]);

  const uploadFileToWalrus = async (
    encryptedBytes: Uint8Array,
    fileName: string
  ): Promise<string> => {
    if (!isReady || !suiClient || !walrusModule) {
      throw new Error("Walrus SDK not ready yet");
    }

    const flow = suiClient.walrus.writeBlobFlow({
      blob: encryptedBytes,
    });

    await flow.encode();
    const registerTx = flow.register({
      epochs: 5,
      owner: address,
      deletable: true,
    });

    const {digest} = await signAndExecuteTransaction({transaction: registerTx});
    await flow.upload({digest});
    const certifyTx = flow.certify();
    await signAndExecuteTransaction({transaction: certifyTx});
    const blobResult = await flow.getBlob();
    return blobResult.blobId;
  };

  const fetchBlobFromWalrus = async (blobId: string): Promise<Uint8Array> => {
    if (!isReady || !suiClient) {
      throw new Error("Walrus SDK not ready yet");
    }

    const fileData = await suiClient.walrus.readBlob({blobId});
    console.log("Walrus File", fileData);

    return fileData;
  };

  return {
    uploadFileToWalrus,
    fetchBlobFromWalrus,
    isReady,
  };
}
