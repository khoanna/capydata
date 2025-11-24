"use client";

import { useState, useRef, useEffect } from "react";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { Asset } from "@/type/Item";
import AssetCard from "./AssetCard";
import SkeletonCard from "@/components/Common/SkeletonCard";

interface AssetGridProps {
  assets: Asset[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 9;

const AssetGrid = ({ assets, isLoading = false }: AssetGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(assets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAssets = assets.slice(startIndex, endIndex);

  // Reset to page 1 when assets change (e.g., filter/search applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [assets.length]);

  useEffect(() => {
    if (gridRef.current) {
      // Scroll to top of grid when page changes
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      requestAnimationFrame(() => {
        const revealElements = gridRef.current?.querySelectorAll('.reveal');
        revealElements?.forEach((el) => {
          el.classList.add('active');
        });
      });
    }
  }, [currentPage, currentAssets]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} variant="asset" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card rounded-xl">
        <Inbox className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="font-sans text-xl font-bold text-gray-400 mb-2">
          No datasets found
        </h3>
        <p className="font-mono text-sm text-gray-600 text-center max-w-md">
          Try adjusting your filters or search query to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAssets.map((asset, index) => (
          <div key={asset.id.id} className={`stagger-${Math.min(index % 10 + 1, 10)}`}>
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          {/* Page info */}
          <p className="font-mono text-sm text-gray-400">
            Showing {startIndex + 1} - {Math.min(endIndex, assets.length)} of {assets.length} datasets
          </p>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all flex items-center gap-2 ${
                currentPage === 1
                  ? 'glass-input text-gray-600 cursor-not-allowed'
                  : 'glass-input hover:border-yuzu/50 text-white hover:text-yuzu'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-2">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  disabled={page === '...'}
                  className={`w-10 h-10 rounded-lg font-mono text-sm transition-all ${
                    page === currentPage
                      ? 'bg-yuzu text-void font-bold'
                      : page === '...'
                      ? 'glass-input text-gray-500 cursor-default'
                      : 'glass-input hover:border-yuzu/50 text-white hover:text-yuzu'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all flex items-center gap-2 ${
                currentPage === totalPages
                  ? 'glass-input text-gray-600 cursor-not-allowed'
                  : 'glass-input hover:border-yuzu/50 text-white hover:text-yuzu'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default AssetGrid;
