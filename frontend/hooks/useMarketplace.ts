import {useState} from "react";
import useSeal from "./useSeal";
import useWalrus from "./useWalrus";
import {Transaction} from "@mysten/sui/transactions";
import {PACKAGE_ID, MARKETPLACE_ID, NFT_TYPE} from "@/lib/constants";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import {Asset} from "@/type/Item";
import {mistToSui, suiToMist} from "@/lib/utils";

export default function useMarketplace() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
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
    price: number
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
          tx.object(MARKETPLACE_ID),
          tx.object("0x6"),
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
    filetype: string,
    datasetId: string
  ) => {
    setLoading(true);
    try {
      const nftObjects = await client.getOwnedObjects({
        owner: currentAccount?.address || "",
        filter: {
          StructType: NFT_TYPE,
        },
        options: {
          showContent: true,
        },
      });

      const nft = nftObjects.data.find((obj) => {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as { dataset_id: string };
          return fields.dataset_id === datasetId;
        }
        return false;
      });

      if (!nft) {
        throw new Error("NFT not found for this dataset");
      }
      
      const encryptedBytes = await fetchBlobFromWalrus(blobId);

      const decryptedBytes = await decrypt(encryptedBytes, datasetId, nft.data?.objectId || "");

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
      const fields = item.data?.content?.fields as unknown as Asset;

      return {
        ...fields,
        price: mistToSui(fields.price),
      };
    });

    return filtedItemList as unknown as Asset[];
  };

  const buyDataset = async (asset: Asset) => {
    setLoading(true);
    try {
      if (!currentAccount?.address) {
        throw new Error("Wallet not connected");
      }

      const priceInMist = suiToMist(asset.price);

      const coins = await client.getCoins({
        owner: currentAccount.address,
        coinType: "0x2::sui::SUI",
      });

      if (coins.data.length === 0) {
        throw new Error("No SUI coins found");
      }

      const totalBalance = coins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0)
      );

      if (totalBalance < BigInt(priceInMist)) {
        throw new Error(
          `Insufficient balance. Required: ${
            asset.price
          } SUI, Available: ${mistToSui(Number(totalBalance))} SUI`
        );
      }

      const tx = new Transaction();

      const [paymentCoin] = tx.splitCoins(tx.gas, [priceInMist + 1]);

      tx.moveCall({
        target: `${PACKAGE_ID}::access::buy_dataset`,
        typeArguments: [],
        arguments: [
          tx.object(asset.id.id),
          tx.object(MARKETPLACE_ID),
          paymentCoin,
          tx.object("0x6"),
        ],
      });

      tx.transferObjects([paymentCoin], currentAccount.address);

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
      });

      return result;
    } catch (error) {
      console.error("Buy dataset error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserDatasets = async () => {
    if (!currentAccount?.address) {
      console.log("Wallet not connected, skipping getUserDatasets");
      return [];
    }

    const allNFTs = await client.getOwnedObjects({
      owner: currentAccount.address,
      filter: {
        StructType: NFT_TYPE,
      },
      options: {showContent: true},
    });
    console.log(allNFTs);

    const datasetIds = allNFTs.data.map((nft) => {
      if (!nft?.data?.content || nft.data.content.dataType !== "moveObject") {
        console.error("Invalid PlayingBoard object");
        return;
      }
      const fields = nft.data?.content?.fields as unknown as {dataset_id: string};
      return fields.dataset_id;
    });

    return datasetIds as unknown as string[];
  };

  const delist = async (datasetId: string) => {
    setLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::delist_dataset`,
        typeArguments: [],
        arguments: [
          tx.pure.string(datasetId),
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
      console.error("Delist dataset error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const relist = async (datasetId: string) => {
    setLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::relist_dataset`,
        typeArguments: [],
        arguments: [
          tx.pure.string(datasetId),
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
      console.error("Relist dataset error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    uploadFile,
    getFile,
    getAllListings,
    buyDataset,
    getUserDatasets,
    delist,
    relist,
    isReady,
  };
}
