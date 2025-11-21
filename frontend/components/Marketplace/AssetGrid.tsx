"use client";

import { useState, useRef, useEffect } from "react";
import { Inbox } from "lucide-react";
import { Asset } from "@/type/Item";
import AssetCard from "./AssetCard";
import SkeletonCard from "@/components/Common/SkeletonCard";

interface AssetGridProps {
  assets: Asset[];
  isLoading?: boolean;
}

const AssetGrid = ({ assets, isLoading = false }: AssetGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      requestAnimationFrame(() => {
        const revealElements = gridRef.current?.querySelectorAll('.reveal');
        revealElements?.forEach((el) => {
          el.classList.add('active');
        });
      });
    }
  }, [assets]);

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
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset, index) => (
        <div key={asset.id.id} className={`stagger-${Math.min(index % 10 + 1, 10)}`}>
          <AssetCard asset={asset} />
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;
