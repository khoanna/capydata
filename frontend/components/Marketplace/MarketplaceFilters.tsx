"use client";

import { useState } from "react";
import { AssetType, PriceModel, Chain } from "@/lib/mockData";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";

interface MarketplaceFiltersProps {
  selectedChains: Chain[];
  selectedTypes: AssetType[];
  selectedPriceModels: PriceModel[];
  selectedTags: string[];
  onChainsChange: (chains: Chain[]) => void;
  onTypesChange: (types: AssetType[]) => void;
  onPriceModelsChange: (models: PriceModel[]) => void;
  onTagsChange: (tags: string[]) => void;
  onClearAll: () => void;
  availableTags: string[];
}

const MarketplaceFilters = ({
  selectedChains,
  selectedTypes,
  selectedPriceModels,
  selectedTags,
  onChainsChange,
  onTypesChange,
  onPriceModelsChange,
  onTagsChange,
  onClearAll,
  availableTags,
}: MarketplaceFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState({
    chains: true,
    types: true,
    priceModels: true,
    tags: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const chains: { value: Chain; label: string; color: string }[] = [
    { value: "sui", label: "Sui", color: "text-cyan-400" },
    { value: "polygon", label: "Polygon", color: "text-purple-400" },
    { value: "ethereum", label: "Ethereum", color: "text-blue-400" },
    { value: "bsc", label: "BSC", color: "text-yellow-400" },
    { value: "moonriver", label: "Moonriver", color: "text-teal-400" },
  ];

  const types: { value: AssetType; label: string; icon: string }[] = [
    { value: "dataset", label: "Dataset", icon: "database" },
    { value: "algorithm", label: "Algorithm", icon: "cpu" },
    { value: "stream", label: "Stream", icon: "radio" },
    { value: "storage", label: "Storage", icon: "hard-drive" },
  ];

  const priceModels: { value: PriceModel; label: string }[] = [
    { value: "free", label: "Free" },
    { value: "fixed", label: "Fixed Price" },
    { value: "dynamic", label: "Dynamic (AMM)" },
  ];

  const toggleChain = (chain: Chain) => {
    if (selectedChains.includes(chain)) {
      onChainsChange(selectedChains.filter((c) => c !== chain));
    } else {
      onChainsChange([...selectedChains, chain]);
    }
  };

  const toggleType = (type: AssetType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const togglePriceModel = (model: PriceModel) => {
    if (selectedPriceModels.includes(model)) {
      onPriceModelsChange(selectedPriceModels.filter((m) => m !== model));
    } else {
      onPriceModelsChange([...selectedPriceModels, model]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const hasActiveFilters =
    selectedChains.length > 0 ||
    selectedTypes.length > 0 ||
    selectedPriceModels.length > 0 ||
    selectedTags.length > 0;

  return (
    <div className="glass-card p-6 sticky top-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans font-bold text-xl text-white flex items-center gap-2 py-1">
          <i data-lucide="filter" className="w-5 h-5 text-yuzu"></i>
          Filters
        </h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Chain Selector */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("chains")}
          className="w-full flex items-center justify-between mb-3 font-mono text-xs text-gray-400 hover:text-yuzu transition-colors"
        >
          <span className="tracking-widest">CHAIN</span>
          <i
            data-lucide={expandedSections.chains ? "chevron-up" : "chevron-down"}
            className="w-4 h-4"
          ></i>
        </button>
        {expandedSections.chains && (
          <div className="space-y-2">
            {chains.map((chain) => (
              <label
                key={chain.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedChains.includes(chain.value)}
                  onChange={() => toggleChain(chain.value)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-yuzu checked:border-yuzu accent-yuzu"
                />
                <span className={`w-2 h-2 rounded-full ${chain.color}`}></span>
                <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                  {chain.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Asset Type */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("types")}
          className="w-full flex items-center justify-between mb-3 font-mono text-xs text-gray-400 hover:text-yuzu transition-colors"
        >
          <span className="tracking-widest">ASSET TYPE</span>
          <i
            data-lucide={expandedSections.types ? "chevron-up" : "chevron-down"}
            className="w-4 h-4"
          ></i>
        </button>
        {expandedSections.types && (
          <div className="space-y-2">
            {types.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-yuzu checked:border-yuzu accent-yuzu"
                />
                <i data-lucide={type.icon} className="w-4 h-4 text-gray-400"></i>
                <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Model */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("priceModels")}
          className="w-full flex items-center justify-between mb-3 font-mono text-xs text-gray-400 hover:text-yuzu transition-colors"
        >
          <span className="tracking-widest">PRICE MODEL</span>
          <i
            data-lucide={expandedSections.priceModels ? "chevron-up" : "chevron-down"}
            className="w-4 h-4"
          ></i>
        </button>
        {expandedSections.priceModels && (
          <div className="space-y-2">
            {priceModels.map((model) => (
              <label
                key={model.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedPriceModels.includes(model.value)}
                  onChange={() => togglePriceModel(model.value)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-yuzu checked:border-yuzu accent-yuzu"
                />
                <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                  {model.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <button
          onClick={() => toggleSection("tags")}
          className="w-full flex items-center justify-between mb-3 font-mono text-xs text-gray-400 hover:text-yuzu transition-colors"
        >
          <span className="tracking-widest">TAGS</span>
          <i
            data-lucide={expandedSections.tags ? "chevron-up" : "chevron-down"}
            className="w-4 h-4"
          ></i>
        </button>
        {expandedSections.tags && (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-yuzu text-black border border-yuzu"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-yuzu/50 hover:text-yuzu"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceFilters;
