"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import MarketplaceFilters from "@/components/Marketplace/MarketplaceFilters";
import AssetGrid from "@/components/Marketplace/AssetGrid";
import { useAppContext } from "@/context/AppContext";
import type { Asset } from "@/type/Item";

export default function MarketplacePage() {
  const { allListings, appLoading } = useAppContext();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "price">("popular");
  const [showFilters, setShowFilters] = useState(true);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const availableTags = useMemo(() => {
    if (!allListings) return [];
    
    const tags = new Set<string>();
    allListings.forEach((asset: Asset) => asset.tags.forEach((tag: string) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [allListings]);

  useEffect(() => {
    if (selectedTags.length > 0) {
      const validTags = selectedTags.filter(tag => availableTags.includes(tag));
      if (validTags.length !== selectedTags.length) {
        setSelectedTags(validTags);
      }
    }
  }, [availableTags, selectedTags]);

  const filteredAssets = useMemo(() => {
    if (!allListings) return [];

    let assets: Asset[] = [...allListings];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter(
        (asset) =>
          asset.title.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      assets = assets.filter((asset) =>
        selectedTags.every((tag) => asset.tags.includes(tag))
      );
    }

    // Filter by price range
    if (minPrice !== undefined) {
      assets = assets.filter((asset) => asset.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      assets = assets.filter((asset) => asset.price <= maxPrice);
    }

    // Sort
    if (sortBy === "popular") {
      assets = [...assets].sort((a, b) => b.amount_sold - a.amount_sold);
    } else if (sortBy === "price") {
      assets = [...assets].sort((a, b) => a.price - b.price);
    } else if (sortBy === "recent") {
      assets = [...assets].sort((a, b) => b.release_date - a.release_date);
    }

    return assets;
  }, [allListings, selectedTags, searchQuery, sortBy, minPrice, maxPrice]);

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchQuery("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  return (
    <main className="min-h-screen pt-28 pb-20 bg-void">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 reveal">
          <h1 className="text-5xl md:text-6xl font-sans font-bold text-white mb-4">
            Data Marketplace
          </h1>
          <p className="font-mono text-gray-400 text-sm max-w-2xl">
            Discover high-quality datasets, algorithms, and data streams from verified
            publishers. All secured on-chain with privacy-preserving compute options.
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 reveal delay-100">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets by keyword..."
              className="w-full glass-input pl-12 pr-4 py-3 rounded-lg font-mono text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="font-mono text-xs">
                {showFilters ? "Hide" : "Show"} Filters
              </span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 glass-input rounded-lg font-mono text-sm cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 reveal delay-300">
          <p className="font-mono text-sm text-gray-400">
            {filteredAssets.length} {filteredAssets.length === 1 ? "result" : "results"} found
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-3 reveal delay-400">
              <MarketplaceFilters
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onClearAll={clearAllFilters}
                availableTags={availableTags}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
              />
            </div>
          )}

          {/* Asset Grid */}
          <div className={showFilters ? "lg:col-span-9" : "lg:col-span-12"}>
            {appLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-yuzu border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-mono text-sm text-gray-400">Loading datasets...</p>
                </div>
              </div>
            ) : (
              <AssetGrid assets={filteredAssets} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
