"use client";
import { ArrowRight, BarChart, Inbox, Trophy, UploadCloud } from "lucide-react";

import { useState } from "react";
import AssetCard from "@/components/Marketplace/AssetCard";
import Button from "@/components/Common/Button";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface PublishedTabProps {
  address: string;
}

const PublishedTab = ({ address }: PublishedTabProps) => {
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "revenue">("recent");
  const { allListings } = useAppContext();
  const currentAccount = useCurrentAccount();

  // Filter assets published by this address
  const publishedAssets = allListings?.filter(asset => asset.owner === address) || [];
  
  // Check if viewing own profile
  const isOwnProfile = currentAccount?.address === address;

  const sortedAssets = [...publishedAssets].sort((a, b) => {
    if (sortBy === "recent") return b.release_date - a.release_date;
    if (sortBy === "popular") return b.amount_sold - a.amount_sold;
    if (sortBy === "revenue") return b.price * b.amount_sold - a.price * a.amount_sold;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm text-gray-400">
            {publishedAssets.length} dataset{publishedAssets.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 glass-input rounded-lg font-mono text-xs text-white border-none focus:outline-none focus:ring-2 focus:ring-yuzu/50"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="revenue">Highest Revenue</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      {publishedAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssets.map((asset, index) => (
            <div key={asset.id.id} className="reveal" style={{ animationDelay: `${index * 100}ms` }}>
              <AssetCard asset={asset} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-lg text-center">
          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">
            No Published Datasets
          </h3>
          <p className="font-mono text-sm text-gray-400 mb-6 max-w-md mx-auto">
            {isOwnProfile 
              ? "You haven't published any datasets yet. Start earning by sharing your data on the marketplace."
              : "This user hasn't published any datasets yet."
            }
          </p>
          {isOwnProfile && (
            <Link href="/publish" className="flex items-center justify-center">
              <Button variant="primary" size="lg">
                <UploadCloud className="w-5 h-5" />
                Publish Dataset
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Quick Stats for Published Assets */}
      {publishedAssets.length > 0 && (
        <div className="glass-card p-6 rounded-lg">
          <h3 className="font-sans font-bold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-yuzu" />
            Publishing Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 glass-input rounded-lg">
              <p className="font-mono text-xs text-gray-400 mb-1">Total Sales</p>
              <p className="font-sans text-2xl font-bold text-white">
                {publishedAssets.reduce((sum, asset) => sum + asset.amount_sold, 0)}
              </p>
            </div>
            <div className="p-4 glass-input rounded-lg">
              <p className="font-mono text-xs text-gray-400 mb-1">Total Revenue</p>
              <p className="font-sans text-2xl font-bold text-yuzu">
                {publishedAssets
                  .reduce((sum, asset) => sum + asset.price * asset.amount_sold, 0)
                  .toLocaleString()}
                <span className="text-sm ml-1">CAPY</span>
              </p>
            </div>
            <div className="p-4 glass-input rounded-lg">
              <p className="font-mono text-xs text-gray-400 mb-1">Avg Price</p>
              <p className="font-sans text-2xl font-bold text-hydro">
                {(
                  publishedAssets.reduce((sum, asset) => sum + asset.price, 0) /
                  publishedAssets.length
                ).toFixed(0)}
                <span className="text-sm ml-1">CAPY</span>
              </p>
            </div>
            <div className="p-4 glass-input rounded-lg">
              <p className="font-mono text-xs text-gray-400 mb-1">Active Listings</p>
              <p className="font-sans text-2xl font-bold text-grass">
                {publishedAssets.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Dataset */}
      {publishedAssets.length > 0 && (
        <div className="glass-card p-6 rounded-lg border border-yuzu/30">
          <h3 className="font-sans font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yuzu" />
            Top Performing Dataset
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-mono text-sm text-white font-bold mb-1">
                {sortedAssets[0].title}
              </p>
              <p className="font-mono text-xs text-gray-400">
                {sortedAssets[0].amount_sold} sales • {sortedAssets[0].price * sortedAssets[0].amount_sold} CAPY revenue
              </p>
            </div>
            <Link href={`/item/${sortedAssets[0].id.id}`}>
              <Button variant="outline" size="sm">
                View Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishedTab;
