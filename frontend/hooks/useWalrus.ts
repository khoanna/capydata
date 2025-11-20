"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {walrus, WalrusFile} from "@mysten/walrus";

export default function useWalrus() {
  const suiClient = useSuiClient().$extend(
    walrus({
      network: "testnet",
      storageNodeClientOptions: {
        onError: (error) => console.log(error),
      },
    })
  );
  const address = useCurrentAccount()?.address || "";
  const {mutateAsync: signAndExecuteTransaction} =
    useSignAndExecuteTransaction();

  const uploadFileToWalrus = async (
    decryptedBytes: Uint8Array,
    fileName: string
  ): Promise<string> => {
    const flow = suiClient.walrus.writeFilesFlow({
      files: [
        WalrusFile.from({
          contents: decryptedBytes,
          identifier: fileName,
        }),
      ],
    });
    await flow.encode();
    const registerTx = flow.register({
      epochs: 3,
      owner: address,
      deletable: true,
    });
    const {digest} = await signAndExecuteTransaction({transaction: registerTx});
    await flow.upload({digest});
    const certifyTx = flow.certify();
    await signAndExecuteTransaction({transaction: certifyTx});
    const files = await flow.listFiles();
    return files[0].blobId;
  };

  const fetchBlobFromWalrus = async (blobId: string): Promise<Uint8Array> => {
    const [file] = await suiClient.walrus.getFiles({ids: [blobId]});
    const bytes = await file.bytes();
    return bytes;
  };
  
  return {
    uploadFileToWalrus,
    fetchBlobFromWalrus,
  };
}
