"use client";
import { ArrowRight, BarChart, Inbox, Search, Trophy, UploadCloud } from "lucide-react";

import { useState } from "react";
import { mockAssets } from "@/lib/mockData";
import AssetCard from "@/components/Marketplace/AssetCard";
import Button from "@/components/Common/Button";
import Link from "next/link";

interface PublishedTabProps {
  address: string;
}

const PublishedTab = ({ address }: PublishedTabProps) => {
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "revenue">("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock user's published assets (filter first 6 from mockAssets)
  const publishedAssets = mockAssets.slice(0, 6);

  // Filter by search query
  const filteredAssets = publishedAssets.filter((asset) =>
    asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === "recent") return b.id.localeCompare(a.id);
    if (sortBy === "popular") return b.amount_sold - a.amount_sold;
    if (sortBy === "revenue") return b.price * b.amount_sold - a.price * a.amount_sold;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <p className="font-mono text-sm text-gray-400 shrink-0">
            {filteredAssets.length} dataset{filteredAssets.length !== 1 ? "s" : ""}
          </p>

          {/* Search Input */}
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-input rounded-lg font-mono text-sm text-white placeholder:text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-yuzu/50"
            />
          </div>
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
      {sortedAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssets.map((asset, index) => (
            <div key={asset.id} className="reveal" style={{ animationDelay: `${index * 100}ms` }}>
              <AssetCard asset={asset} />
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="glass-card p-16 rounded-lg text-center">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">
            No Results Found
          </h3>
          <p className="font-mono text-sm text-gray-400 mb-6 max-w-md mx-auto">
            No datasets match your search query "{searchQuery}". Try different keywords.
          </p>
          <Button variant="outline" size="md" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="glass-card p-16 rounded-lg text-center">
          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">
            No Published Datasets
          </h3>
          <p className="font-mono text-sm text-gray-400 mb-6 max-w-md mx-auto">
            You haven't published any datasets yet. Start earning by sharing your data
            on the marketplace.
          </p>
          <Link href="/publish">
            <Button variant="primary" size="lg">
              <UploadCloud className="w-5 h-5" />
              Publish Dataset
            </Button>
          </Link>
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
            <Link href={`/item/${sortedAssets[0].id}`}>
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
