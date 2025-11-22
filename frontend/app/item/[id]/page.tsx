"use client";

import { use, useState } from "react";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import SimpleAssetHeader from "@/components/ItemDetail/SimpleAssetHeader";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import useMarketplace from "@/hooks/useMarketplace";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/useToast";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { allListings, appLoading, userDatasets, fetchUserDatasets } = useAppContext();
  const { buyDataset, loading } = useMarketplace();
  const currentAccount = useCurrentAccount();
  const { addToast } = useToast();

  const asset = allListings?.find((item) => item.id.id === id);

  if (appLoading || !allListings) {
    return (
      <main className="min-h-screen pt-28 pb-20 bg-void">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-yuzu border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-mono text-sm text-gray-400">Loading dataset...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!asset) {
    notFound();
  }

  const isOwner = currentAccount?.address === asset.owner;
  
  const hasPurchased = userDatasets?.includes(id) || false;

  const handlePurchase = async () => {
    if (!currentAccount) {
      addToast("Please connect your wallet first", "error");
      return;
    }

    if (isOwner) {
      addToast("You cannot purchase your own dataset", "error");
      return;
    }

    if (hasPurchased) {
      addToast("You have already purchased this dataset", "error");
      return;
    }

    try {
      addToast("Processing purchase...", "info");
      await buyDataset(asset);
      addToast("Dataset purchased successfully!", "success");
      await fetchUserDatasets();
    } catch (error) {
      console.error("Purchase error:", error);
      addToast(
        `Purchase failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 bg-void">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6 flex items-center gap-2 font-mono text-xs text-gray-400 reveal">
          <Link href="/" className="hover:text-yuzu transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/marketplace" className="hover:text-yuzu transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">{asset.title}</span>
        </div>

        <div className="space-y-8">
          <SimpleAssetHeader 
            asset={asset} 
            onPurchase={!isOwner && !hasPurchased ? handlePurchase : undefined}
            loading={loading}
            isOwner={isOwner}
            hasPurchased={hasPurchased}
          />

          <div className="glass-card p-8 rounded-xl reveal delay-100">
            <h2 className="text-2xl font-sans font-bold text-white mb-4">
              About This Dataset
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                {asset.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal delay-200">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yuzu/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yuzu" />
                </div>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                  File Type
                </p>
              </div>
              <p className="text-2xl font-sans font-bold text-white uppercase">
                {asset.filetype}
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-grass/10 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-grass" />
                </div>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                  Total Sales
                </p>
              </div>
              <p className="text-2xl font-sans font-bold text-white">
                {asset.amount_sold.toLocaleString()}
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-hydro/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-hydro" />
                </div>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </p>
              </div>
              <p className="text-2xl font-sans font-bold text-white">
                {(asset.price * asset.amount_sold).toLocaleString()} SUI
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yuzu/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yuzu" />
                </div>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </p>
              </div>
              <p className="text-2xl font-sans font-bold text-white">
                {asset.on_listed ? 'Listed' : 'Unlisted'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 reveal delay-400">
          <h2 className="text-3xl font-sans font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yuzu" />
            Similar Datasets
          </h2>
          <p className="font-mono text-sm text-gray-400 mb-6">
            Explore more datasets with similar tags
          </p>
          <Link href="/marketplace">
            <button className="px-6 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all font-mono text-sm text-white flex items-center gap-2 group">
              Browse Marketplace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
