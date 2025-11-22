"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MarketplaceFiltersProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClearAll: () => void;
  availableTags: string[];
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
}

const MarketplaceFilters = ({
  selectedTags,
  onTagsChange,
  onClearAll,
  availableTags,
  minPrice,
  maxPrice,
  onPriceChange,
}: MarketplaceFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    tags: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };


  return (
    <div className="glass-card p-6 rounded-xl sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-bold text-white">Filters</h3>
      </div>

      {/* Price Range */}
      <div className="mb-6 group">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between mb-3 font-mono text-xs text-gray-400 hover:text-yuzu transition-colors"
        >
          <span className="tracking-widest">PRICE (SUI)</span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex justify-between items-center font-mono text-xs px-1">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Min:</span>
                <span className="text-yuzu font-bold">{minPrice ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Max:</span>
                <span className="text-yuzu font-bold">{maxPrice ?? 1000}</span>
              </div>
            </div>

            {/* Dual Range Slider */}
            <div className="relative h-8 pt-3">
              {/* Track */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-white/10 rounded-full z-0" />
              
              {/* Highlight */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-linear-to-r from-yuzu/50 to-yuzu rounded-full z-10"
                style={{
                  left: `${((minPrice ?? 0) / 1000) * 100}%`,
                  width: `${(((maxPrice ?? 1000) - (minPrice ?? 0)) / 1000) * 100}%`
                }}
              />
              
              {/* Min Range Input */}
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={minPrice ?? 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const newMin = val === 0 ? undefined : val;
                  if (maxPrice !== undefined && val > maxPrice) {
                    onPriceChange(maxPrice, maxPrice);
                  } else {
                    onPriceChange(newMin, maxPrice);
                  }
                }}
                className="w-full bg-transparent appearance-none absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yuzu [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-void [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-yuzu [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
              />
              
              {/* Max Range Input */}
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={maxPrice ?? 1000}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const newMax = val === 1000 ? undefined : val;
                  if (minPrice !== undefined && val < minPrice) {
                    onPriceChange(minPrice, minPrice);
                  } else {
                    onPriceChange(minPrice, newMax);
                  }
                }}
                className="w-full bg-transparent appearance-none absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yuzu [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-void [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-yuzu [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
              />
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => onPriceChange(undefined, 0)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  maxPrice === 0 && minPrice === undefined
                    ? "bg-yuzu text-void font-bold"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-yuzu hover:border-yuzu/50"
                }`}
              >
                Free
              </button>
              <button
                onClick={() => onPriceChange(undefined, 50)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  maxPrice === 50 && minPrice === undefined
                    ? "bg-yuzu text-void font-bold"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-yuzu hover:border-yuzu/50"
                }`}
              >
                &lt;50
              </button>
              <button
                onClick={() => onPriceChange(undefined, 100)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  maxPrice === 100 && minPrice === undefined
                    ? "bg-yuzu text-void font-bold"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-yuzu hover:border-yuzu/50"
                }`}
              >
                &lt;100
              </button>
              <button
                onClick={() => onPriceChange(undefined, 500)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  maxPrice === 500 && minPrice === undefined
                    ? "bg-yuzu text-void font-bold"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-yuzu hover:border-yuzu/50"
                }`}
              >
                &lt;500
              </button>
              <button
                onClick={() => onPriceChange(undefined, undefined)}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-400 hover:text-yuzu hover:border-yuzu/50 transition-all"
              >
                Any
              </button>
            </div>
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
          {expandedSections.tags ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.tags && (
          <div className="flex flex-wrap gap-2">
            {availableTags.length === 0 ? (
              <p className="font-mono text-xs text-gray-600">No tags available</p>
            ) : (
              availableTags.map((tag) => (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceFilters;
