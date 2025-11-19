import { Asset } from "@/lib/mockData";
import { truncateAddress, formatDate, timeAgo } from "@/lib/utils";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";

interface AssetHeaderProps {
  asset: Asset;
}

const AssetHeader = ({ asset }: AssetHeaderProps) => {
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
    <div className="glass-card p-8 reveal">
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Badge variant="type">
          <i data-lucide={typeIcons[asset.type]} className="w-3 h-3"></i>
          {asset.type.toUpperCase()}
        </Badge>

        <Badge variant="chain">
          <span className={`w-2 h-2 rounded-full ${chainColors[asset.chain]}`}></span>
          {asset.chain.toUpperCase()}
        </Badge>

        {asset.featured && (
          <Badge variant="success">
            <i data-lucide="star" className="w-3 h-3"></i>
            FEATURED
          </Badge>
        )}

        {asset.c2dEnabled && (
          <Badge variant="info">
            <i data-lucide="shield-check" className="w-3 h-3"></i>
            COMPUTE-TO-DATA
          </Badge>
        )}

        {asset.priceModel === "dynamic" && (
          <Badge variant="pending">
            <i data-lucide="trending-up" className="w-3 h-3"></i>
            DYNAMIC PRICING
          </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-sans font-bold text-white mb-4">
        {asset.title}
      </h1>

      {/* Owner Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-yuzu-hydro flex items-center justify-center">
          <i data-lucide="user" className="w-5 h-5 text-black"></i>
        </div>
        <div>
          <p className="font-mono text-xs text-gray-400">Published by</p>
          <a
            href={`/profile/${asset.owner.address}`}
            className="font-mono text-sm text-white hover:text-yuzu transition-colors flex items-center gap-1"
          >
            {asset.owner.ens || truncateAddress(asset.owner.address)}
            <i data-lucide="external-link" className="w-3 h-3"></i>
          </a>
        </div>
      </div>

      {/* Description */}
      <p className="font-mono text-sm text-gray-300 leading-relaxed mb-6">
        {asset.description}
      </p>

      {/* DID */}
      <div className="p-4 glass-input rounded-lg mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-gray-400 mb-1">
              Decentralized Identifier (DID)
            </p>
            <p className="font-mono text-xs text-white break-all">{asset.did}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(asset.did)}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors group"
            title="Copy DID"
          >
            <i data-lucide="copy" className="w-4 h-4 text-gray-400 group-hover:text-yuzu"></i>
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {asset.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-gray-400 hover:text-yuzu hover:border-yuzu/30 transition-all cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
        <div>
          <p className="font-mono text-xs text-gray-400 mb-1">Created</p>
          <p className="font-mono text-sm text-white">
            {formatDate(asset.createdAt)}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs text-gray-400 mb-1">Last Updated</p>
          <p className="font-mono text-sm text-white">
            {timeAgo(asset.lastUpdated)}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs text-gray-400 mb-1">Total Sales</p>
          <p className="font-mono text-sm text-white flex items-center gap-1">
            <i data-lucide="shopping-cart" className="w-3 h-3"></i>
            {asset.sales}
          </p>
        </div>
        {asset.fileSize && (
          <div>
            <p className="font-mono text-xs text-gray-400 mb-1">File Size</p>
            <p className="font-mono text-sm text-white">{asset.fileSize}</p>
          </div>
        )}
      </div>

      {/* Share Buttons */}
      <div className="flex items-center gap-2 pt-6 border-t border-white/10 mt-6">
        <p className="font-mono text-xs text-gray-400 mr-2">Share:</p>
        <button className="p-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group">
          <i data-lucide="twitter" className="w-4 h-4 text-gray-400 group-hover:text-yuzu"></i>
        </button>
        <button className="p-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group">
          <i data-lucide="link" className="w-4 h-4 text-gray-400 group-hover:text-yuzu"></i>
        </button>
        <button className="p-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group">
          <i data-lucide="send" className="w-4 h-4 text-gray-400 group-hover:text-yuzu"></i>
        </button>
      </div>
    </div>
  );
};

export default AssetHeader;
