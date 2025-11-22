import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/constants";
import { useState } from "react";
import { suiToMist } from "@/lib/utils";

export default function useProfile() {
    const client = useSuiClient();
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [loading, setLoading] = useState(false);

    const setTitle = async (datasetId: string, newTitle: string) => {
        if (!currentAccount?.address) throw new Error("Wallet not connected");
        setLoading(true);
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::marketplace::set_title`,
                arguments: [
                    tx.object(datasetId),
                    tx.pure.string(newTitle)
                ]
            });
            const result = await signAndExecuteTransaction({ transaction: tx });
            await client.waitForTransaction({ digest: result.digest });
            return result;
        } finally {
            setLoading(false);
        }
    }

    const setDescription = async (datasetId: string, newDescription: string) => {
        if (!currentAccount?.address) throw new Error("Wallet not connected");
        setLoading(true);
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::marketplace::set_description`,
                arguments: [
                    tx.object(datasetId),
                    tx.pure.string(newDescription)
                ]
            });
            const result = await signAndExecuteTransaction({ transaction: tx });
            await client.waitForTransaction({ digest: result.digest });
            return result;
        } finally {
            setLoading(false);
        }
    }

    const setPrice = async (datasetId: string, newPrice: number) => {
        if (!currentAccount?.address) throw new Error("Wallet not connected");
        setLoading(true);
        try {
            const tx = new Transaction();
            const priceInMist = suiToMist(newPrice);
            tx.moveCall({
                target: `${PACKAGE_ID}::marketplace::set_price`,
                arguments: [
                    tx.object(datasetId),
                    tx.pure.u64(priceInMist)
                ]
            });
            const result = await signAndExecuteTransaction({ transaction: tx });
            await client.waitForTransaction({ digest: result.digest });
            return result;
        } finally {
            setLoading(false);
        }
    }

    return {
        setTitle,
        setDescription,
        setPrice,
        loading
    }
}
