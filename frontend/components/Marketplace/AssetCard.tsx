import Link from "next/link";
import { Asset } from "@/lib/mockData";
import { formatPrice, capyToUSD, formatUSD } from "@/lib/utils";
import Badge from "@/components/Common/Badge";
import Card from "@/components/Common/Card";

interface AssetCardProps {
  asset: Asset;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const chainColors: Record<string, string> = {
    polygon: "text-purple-400",
    ethereum: "text-blue-400",
    bsc: "text-yellow-400",
    moonriver: "text-teal-400",
    sui: "text-cyan-400",
  };

  const typeIcons: Record<string, string> = {
    dataset: "database",
    algorithm: "cpu",
    stream: "radio",
    storage: "hard-drive",
  };

  return (
    <Link href={`/item/${asset.id}`}>
      <Card
        variant="glass"
        hover
        glow="yuzu"
        className="p-0 overflow-hidden group reveal h-full flex flex-col"
      >
        {/* Thumbnail */}
        <div
          className="relative w-full h-48 overflow-hidden bg-panel"
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />

          {/* Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="type" size="sm">
              <i data-lucide={typeIcons[asset.type]} className="w-3 h-3"></i>
              {asset.type.toUpperCase()}
            </Badge>
          </div>

          {/* Chain Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="chain" size="sm">
              <span className={`w-2 h-2 rounded-full ${chainColors[asset.chain]}`}></span>
              {asset.chain.toUpperCase()}
            </Badge>
          </div>

          {/* Featured Badge */}
          {asset.featured && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge variant="success" size="sm">
                <i data-lucide="star" className="w-3 h-3"></i>
                FEATURED
              </Badge>
            </div>
          )}

          {/* C2D Badge */}
          {asset.c2dEnabled && (
            <div className="absolute bottom-3 right-3 z-10">
              <Badge variant="info" size="sm">
                <i data-lucide="shield-check" className="w-3 h-3"></i>
                C2D
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-sans font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-yuzu transition-colors">
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
                className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-500 hover:text-yuzu hover:border-yuzu/30 transition-all"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-mono text-gray-500">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {/* Price */}
            <div>
              {asset.priceModel === "free" ? (
                <Badge variant="success" size="md">
                  <i data-lucide="gift" className="w-3 h-3"></i>
                  FREE
                </Badge>
              ) : (
                <div>
                  <Badge variant="price" size="md" className="text-white">
                    {formatPrice(asset.price)}
                  </Badge>
                  <p className="font-mono text-[10px] text-gray-600 mt-1">
                    ~{formatUSD(capyToUSD(asset.price))}
                  </p>
                </div>
              )}
            </div>

            {/* Sales / TVL */}
            <div className="text-right">
              <p className="font-mono text-xs text-gray-400 flex items-center gap-1">
                <i data-lucide="shopping-cart" className="w-3 h-3"></i>
                {asset.sales} sales
              </p>
              {asset.tvl && (
                <p className="font-mono text-[10px] text-gray-600">
                  TVL: {formatUSD(asset.tvl)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default AssetCard;
