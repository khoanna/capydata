"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Tag, X, Plus, ChevronDown } from "lucide-react";
import Badge from "./Badge";

interface TagDropdownProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  label?: string;
  hint?: string;
  placeholder?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

const TagDropdown = ({
  selectedTags,
  onTagsChange,
  availableTags,
  label = "Tags",
  hint = "Search and select tags for your dataset",
  placeholder = "Search tags...",
  onOpenChange,
}: TagDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notify parent when dropdown state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Filter available tags based on search query
  const filteredTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
      setSearchQuery("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && !selectedTags.includes(trimmedQuery)) {
      onTagsChange([...selectedTags, trimmedQuery]);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]);
      } else if (searchQuery.trim()) {
        handleAddCustomTag();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block font-mono text-xs text-gray-400 tracking-wide">
        {label}
      </label>

      {/* Dropdown Input */}
      <div className="relative" ref={dropdownRef}>
        <div
          className={`relative flex items-center gap-2 glass-input rounded-lg transition-all duration-300 ${
            isOpen ? "border-yuzu/50 shadow-[0_0_20px_rgba(255,159,28,0.2)]" : ""
          }`}
        >
          <Tag className="w-4 h-4 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none py-3 px-0 text-sm text-white placeholder:text-gray-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-yuzu transition-colors pr-4 pl-2"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="relative z-50 w-full mt-2 glass-card rounded-lg border border-white/10 shadow-xl max-h-64 overflow-y-auto backdrop-blur-xl
            animate-in fade-in slide-in-from-top-2 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
            {/* Add custom tag option */}
            {searchQuery.trim() && !availableTags.includes(searchQuery.trim()) && (
              <button
                onClick={handleAddCustomTag}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-yuzu/10 transition-all border-b border-white/5 group"
              >
                <Plus className="w-4 h-4 text-yuzu" />
                <span className="font-mono text-sm text-white">
                  Add custom tag:{" "}
                  <span className="text-yuzu font-bold">"{searchQuery.trim()}"</span>
                </span>
              </button>
            )}

            {/* Available tags */}
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className="w-full px-4 py-2.5 text-left hover:bg-yuzu/10 transition-all group flex items-center justify-between"
                >
                  <span className="font-mono text-sm text-gray-300 group-hover:text-yuzu transition-colors">
                    {tag}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-gray-500 group-hover:text-yuzu transition-colors" />
                </button>
              ))
            ) : searchQuery && !searchQuery.trim() ? (
              <div className="px-4 py-8 text-center">
                <p className="font-mono text-xs text-gray-500">
                  Type to search tags...
                </p>
              </div>
            ) : !searchQuery ? (
              <div className="px-4 py-8 text-center">
                <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="font-mono text-xs text-gray-500">
                  Start typing to search tags
                </p>
              </div>
            ) : null}

            {/* Popular tags section */}
            {!searchQuery && availableTags.length > 0 && (
              <div className="border-t border-white/5 p-3">
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">
                  Popular Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-400 hover:text-yuzu hover:border-yuzu/50 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint */}
      {hint && (
        <p className="font-mono text-xs text-gray-500 flex items-center gap-2">
          {hint}
        </p>
      )}

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Clear All Button & Count */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">
              {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'} selected
            </span>
            <button
              onClick={() => onTagsChange([])}
              className="group px-3 py-1.5 rounded-lg font-mono text-xs text-gray-400
                hover:text-error hover:bg-error/10 border border-white/10 hover:border-error/50
                transition-all duration-300 flex items-center gap-2"
            >
              <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
              Clear All
            </button>
          </div>

          {/* Tags Grid */}
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="type" size="md">
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 hover:text-error transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagDropdown;
