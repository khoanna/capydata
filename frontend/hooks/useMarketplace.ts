import {useState} from "react";
import useSeal from "./useSeal";
import useWalrus from "./useWalrus";
import {Transaction} from "@mysten/sui/transactions";
import {PACKAGE_ID, MARKETPLACE_ID} from "@/lib/constants";
import {useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import { Asset } from "@/type/Item";

export default function useMarketplace() {
  const client = useSuiClient();
  const [loading, setLoading] = useState(false);
  const {encrypt, decrypt} = useSeal();
  const {uploadFileToWalrus, fetchBlobFromWalrus, isReady} = useWalrus();
  const {mutateAsync: signAndExecuteTransaction} =
    useSignAndExecuteTransaction();

  const uploadFile = async (
    file: File,
    title: string,
    filename: string,
    filetype: string,
    description: string,
    tags: string[],
    price: number,
    release_date: number
  ) => {
    setLoading(true);
    try {
      const encryptedBytes = await encrypt(
        new Uint8Array(await file.arrayBuffer())
      );
      const blobId = await uploadFileToWalrus(encryptedBytes, file.name);
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list_dataset`,
        typeArguments: [],
        arguments: [
          tx.pure.string(blobId),
          tx.pure.string(title),
          tx.pure.string(filename),
          tx.pure.string(filetype),
          tx.pure.string(description),
          tx.pure.vector("string", tags),
          tx.pure.u64(price),
          tx.pure.u64(release_date),
          tx.object(MARKETPLACE_ID),
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
      });

      return result;
    } catch (error) {
      console.error("Upload file error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFile = async (
    blobId: string,
    filename: string,
    filetype: string
  ) => {
    setLoading(true);
    try {
      const encryptedBytes = await fetchBlobFromWalrus(blobId);
      const decryptedBytes = await decrypt(encryptedBytes);
      const Uint8ArrayBytes = new Uint8Array(decryptedBytes);
      const file = new File([Uint8ArrayBytes], filename, {type: filetype});
      return file;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllListings = async () => {
    const marketplaceObject = await client.getObject({
      id: MARKETPLACE_ID,
      options: {showContent: true},
    });

    if (
      !marketplaceObject?.data?.content ||
      marketplaceObject.data.content.dataType !== "moveObject"
    ) {
      console.error("Invalid PlayingBoard object");
      return;
    }

    const marketplaceField = marketplaceObject.data.content
      .fields as unknown as {
      on_sale: string[];
    };

    const onSaleIds = marketplaceField.on_sale;

    const itemList = await Promise.all(
      onSaleIds.map((id) => {
        return client.getObject({
          id,
          options: {showContent: true},
        });
      })
    );

    const filtedItemList = itemList.map((item) => {
      if (!item?.data?.content || item.data.content.dataType !== "moveObject") {
        console.error("Invalid PlayingBoard object");
        return;
      }
      return item.data?.content?.fields;
    });
    
    return filtedItemList as unknown as Asset[];
  };

  return {
    loading,
    uploadFile,
    getFile,
    getAllListings,
    isReady,
  };
}
