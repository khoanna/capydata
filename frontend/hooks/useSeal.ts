"use client";

import {MARKETPLACE_ID, PACKAGE_ID, SERVER_OBJECT_ID} from "@/lib/constants";
import {
  useCurrentAccount,
  useCurrentWallet,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {SealClient, SessionKey} from "@mysten/seal";
import {Transaction} from "@mysten/sui/transactions";
import {fromHex} from "@mysten/sui/utils";

export default function useSeal() {
  // Init Seal client
  const suiClient = useSuiClient();
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_ID.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  // Get current account and wallet
  const {currentWallet} = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address || "";

  const {mutateAsync: signAndExecuteTransaction} =
    useSignAndExecuteTransaction();

  async function encrypt(input: Uint8Array) {
    const {encryptedObject: encryptedBytes, key: backupKey} =
      await sealClient.encrypt({
        id: MARKETPLACE_ID,
        packageId: PACKAGE_ID,
        data: input,
        threshold: 2,
      });
      
    return encryptedBytes;
  }

  async function decrypt(
    encryptedBytes: Uint8Array,
    datasetId: string,
    nftId: string
  ) {
    console.log(encryptedBytes);
    
    const sessionKey = await SessionKey.create({
      address: address,
      packageId: PACKAGE_ID,
      ttlMin: 10,
      suiClient: suiClient,
    });

    const message = sessionKey.getPersonalMessage();

    const result = await currentWallet?.features[
      "sui:signPersonalMessage"
    ]?.signPersonalMessage({
      message,
      account: currentAccount!,
      chain: currentAccount?.chains[0],
    });

    const signature = result?.signature || "";

    sessionKey.setPersonalMessageSignature(signature);

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::access::seal_approve`,
      arguments: [
        tx.pure.vector("u8", Array.from(fromHex(MARKETPLACE_ID))),
        tx.object(datasetId),
        tx.object(nftId),
      ],
    });

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const decryptedBytes = await sealClient.decrypt({
      data: encryptedBytes,
      sessionKey,
      txBytes,
    });

    return decryptedBytes;
  }
  return {
    encrypt,
    decrypt,
  };
}
