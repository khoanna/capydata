import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Asset } from "@/type/Item";
import Badge from "@/components/Common/Badge";
import Card from "@/components/Common/Card";

interface AssetCardProps {
  asset: Asset;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  // Format price for display
  const formatPrice = (price: number) => {
    if (price == 0) return "FREE";
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
    return price.toString();
  };

  // Format sales number
  const formatSales = (sales: number) => {
    if (sales >= 1000) return `${(sales / 1000).toFixed(1)}K`;
    return sales.toString();
  };

  // Format date - handle both number and string timestamps
  const formatDate = (timestamp: number | string) => {
    try {
      const date = new Date(Number(timestamp));
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <Link href={`/item?id=${asset.id.id}`}>
      <Card
        variant="glass"
        hover
        glow="yuzu"
        className="p-5 group reveal h-full flex flex-col relative overflow-hidden"
      >
        {/* Background Accent - Subtle gradient corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-yuzu/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity" />
        
        {/* Header Row - Price & Sales */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <Badge variant={asset.price === 0 ? "success" : "price"} size="sm">
            {formatPrice(asset.price)} {asset.price > 0 && "SUI"}
          </Badge>
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-grass/10 rounded border border-grass/30">
            <TrendingUp className="w-3 h-3 text-grass" />
            <span className="font-mono text-xs text-grass font-bold">{formatSales(asset.amount_sold)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Title */}
          <h3 className="font-sans font-bold text-yuzu text-base mb-2 line-clamp-2 group-hover:text-yuzu/80 transition-colors min-h-12">
            {asset.title}
          </h3>

          {/* Description */}
          <p className="font-mono text-xs text-gray-400 mb-4 line-clamp-2 flex-1">
            {asset.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {asset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-400 hover:text-yuzu hover:border-yuzu/50 transition-colors"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-mono text-gray-600">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer - Release Date */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="font-mono text-xs text-gray-400">
              {formatDate(asset.release_date)}
            </span>
            
            <button className="px-3 py-1.5 bg-yuzu/10 hover:bg-yuzu text-yuzu hover:text-black border border-yuzu/30 hover:border-yuzu rounded font-mono text-xs font-bold transition-all">
              VIEW
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default AssetCard;
