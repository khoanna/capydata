"use client";

import { ShoppingCart, TrendingUp, Calendar, Tag } from "lucide-react";
import { Asset } from "@/type/Item";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import { formatPrice } from "@/lib/utils";

// Format timestamp to readable date
const formatDate = (timestamp: number | string): string => {
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

interface SimpleAssetHeaderProps {
  asset: Asset;
  onPurchase?: () => void;
}

export default function SimpleAssetHeader({ asset, onPurchase }: SimpleAssetHeaderProps) {
  return (
    <div className="glass-card p-8 rounded-xl reveal">
      {/* Title and Price */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-sans font-bold text-white mb-3">
            {asset.title}
          </h1>
          <p className="font-mono text-sm text-gray-400 leading-relaxed">
            {asset.description}
          </p>
        </div>

        <div className="lg:text-right">
          <p className="font-mono text-xs text-gray-500 mb-2">PRICE</p>
          <p className="text-3xl font-sans font-bold text-yuzu mb-4">
            {formatPrice(asset.price)}
          </p>
          {onPurchase && (
            <Button
              onClick={onPurchase}
              variant="primary"
              className="w-full lg:w-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              Purchase Dataset
            </Button>
          )}
        </div>
      </div>

      {/* Stats and Tags */}
      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
        {/* Sales */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
              Total Sales
            </p>
            <p className="font-mono text-sm text-white font-bold">
              {asset.amount_sold.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Release Date */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-hydro/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-hydro" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
              Released
            </p>
            <p className="font-mono text-sm text-white">
              {formatDate(asset.release_date)}
            </p>
          </div>
        </div>

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Tag className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <Badge key={tag} variant="type" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
