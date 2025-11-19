"use client";

import { useState, useMemo, useEffect } from "react";
import MarketplaceFilters from "@/components/Marketplace/MarketplaceFilters";
import AssetGrid from "@/components/Marketplace/AssetGrid";
import {
  filterAssets,
  type AssetType,
  type PriceModel,
  type Chain,
} from "@/lib/mockData";
import Button from "@/components/Common/Button";
import Badge from "@/components/Common/Badge";

export default function MarketplacePage() {
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<AssetType[]>([]);
  const [selectedPriceModels, setSelectedPriceModels] = useState<PriceModel[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "price">("popular");
  const [showFilters, setShowFilters] = useState(true);

  // Calculate available tags dynamically based on current filters (excluding tag filters)
  const availableTags = useMemo(() => {
    const assetsForTags = filterAssets({
      chains: selectedChains.length > 0 ? selectedChains : undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      priceModels: selectedPriceModels.length > 0 ? selectedPriceModels : undefined,
      search: searchQuery || undefined,
      // Exclude tags from this filter to show all available tags for current filters
    });
    
    const tags = new Set<string>();
    assetsForTags.forEach((asset) => asset.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [selectedChains, selectedTypes, selectedPriceModels, searchQuery]);

  // Clean up selected tags when available tags change (remove tags that are no longer available)
  useEffect(() => {
    if (selectedTags.length > 0) {
      const validTags = selectedTags.filter(tag => availableTags.includes(tag));
      if (validTags.length !== selectedTags.length) {
        setSelectedTags(validTags);
      }
    }
  }, [availableTags, selectedTags]);

  // Filter assets based on selected filters
  const filteredAssets = useMemo(() => {
    let assets = filterAssets({
      chains: selectedChains.length > 0 ? selectedChains : undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      priceModels: selectedPriceModels.length > 0 ? selectedPriceModels : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      search: searchQuery || undefined,
    });

    // Sort assets
    if (sortBy === "popular") {
      assets = [...assets].sort((a, b) => b.sales - a.sales);
    } else if (sortBy === "recent") {
      assets = [...assets].sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    } else if (sortBy === "price") {
      assets = [...assets].sort((a, b) => a.price - b.price);
    }

    return assets;
  }, [
    selectedChains,
    selectedTypes,
    selectedPriceModels,
    selectedTags,
    searchQuery,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedChains([]);
    setSelectedTypes([]);
    setSelectedPriceModels([]);
    setSelectedTags([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedChains.length > 0 ||
    selectedTypes.length > 0 ||
    selectedPriceModels.length > 0 ||
    selectedTags.length > 0 ||
    searchQuery.length > 0;

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
            <i
              data-lucide="search"
              className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            ></i>
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
                <i data-lucide="x" className="w-4 h-4"></i>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2"
            >
              <i data-lucide="filter" className="w-4 h-4"></i>
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
              <option value="recent">Most Recent</option>
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
                selectedChains={selectedChains}
                selectedTypes={selectedTypes}
                selectedPriceModels={selectedPriceModels}
                selectedTags={selectedTags}
                onChainsChange={setSelectedChains}
                onTypesChange={setSelectedTypes}
                onPriceModelsChange={setSelectedPriceModels}
                onTagsChange={setSelectedTags}
                onClearAll={clearAllFilters}
                availableTags={availableTags}
              />
            </div>
          )}

          {/* Asset Grid */}
          <div className={showFilters ? "lg:col-span-9" : "lg:col-span-12"}>
            <AssetGrid assets={filteredAssets} />
          </div>
        </div>
      </div>
    </main>
  );
}
