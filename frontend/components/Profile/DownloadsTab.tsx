"use client";
import { Check, Clock, Download, ExternalLink, Eye, Inbox, Info, RotateCcw, Search } from "lucide-react";

import { useEffect, useState } from "react";
import { formatPrice, timeAgo } from "@/lib/utils";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { Asset } from "@/type/Item";
import useMarketplace from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/useToast";

interface DownloadsTabProps {
  address: string;
}

const DownloadsTab = ({ address }: DownloadsTabProps) => {
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { allListings, userDatasets } = useAppContext();
  const {getFile} = useMarketplace();
  const currentAccount = useCurrentAccount();
  const { addToast } = useToast();

  const isOwnProfile = currentAccount?.address === address;

  const purchasedAssets: Asset[] = isOwnProfile && userDatasets
    ? allListings?.filter(asset => userDatasets.includes(asset.id.id)) || []
    : [];

  const filteredDownloads = purchasedAssets.filter((asset) => {
    if (filter === "all") return true;
    return asset.on_listed; 
  });

  const totalSpent = purchasedAssets.reduce((sum, asset) => sum + asset.price, 0);
  const activeAccess = purchasedAssets.filter((asset) => asset.on_listed).length;

  const handleDownload = async (asset: Asset) => {
    setDownloadingId(asset.id.id);
    try {
      const file = await getFile(asset.blob_id, asset.filename, asset.filetype, asset.id.id);
      
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      addToast("This file is expired on Walrus and no more available for download.", "error");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-lg">
          <p className="font-mono text-xs text-gray-400 mb-2">Total Purchased</p>
          <p className="font-sans text-3xl font-bold text-white">
            {purchasedAssets.length}
          </p>
        </div>
        <div className="glass-card p-5 rounded-lg">
          <p className="font-mono text-xs text-gray-400 mb-2">Active Access</p>
          <p className="font-sans text-3xl font-bold text-success">
            {activeAccess}
          </p>
        </div>
        <div className="glass-card p-5 rounded-lg">
          <p className="font-mono text-xs text-gray-400 mb-2">Total Spent</p>
          <p className="font-sans text-3xl font-bold text-yuzu">
            {totalSpent.toLocaleString()}
            <span className="text-sm ml-1">SUI</span>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { value: "all" as const, label: "All", count: purchasedAssets.length },
          { value: "active" as const, label: "Active", count: activeAccess },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all ${
              filter === tab.value
                ? "bg-yuzu text-black"
                : "glass-input text-gray-400 hover:text-white"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Downloads List */}
      {!isOwnProfile ? (
        <div className="glass-card p-16 rounded-lg text-center">
          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">
            Private Information
          </h3>
          <p className="font-mono text-sm text-gray-400">
            Purchase history is only visible to the account owner.
          </p>
        </div>
      ) : filteredDownloads.length > 0 ? (
        <div className="space-y-4">
          {filteredDownloads.map((asset) => (
            <div
              key={asset.id.id}
              className="glass-card p-6 rounded-lg hover:border-yuzu/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Asset Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-bold text-white mb-1">
                        {asset.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-gray-400">
                          Price: {formatPrice(asset.price)}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="font-mono text-gray-400">
                          {asset.filetype.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={asset.on_listed ? "success" : "error"}
                      size="sm"
                    >
                      {asset.on_listed ? "Active" : "Unlisted"}
                    </Badge>
                  </div>

                  {/* Asset Tags */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="type" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleDownload(asset)}
                      disabled={downloadingId === asset.id.id}
                    >
                      <Download className="w-4 h-4" />
                      {downloadingId === asset.id.id ? 'Downloading...' : 'Download'}
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-lg text-center">
          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">
            No {filter !== "all" ? filter : ""} Downloads
          </h3>
          <p className="font-mono text-sm text-gray-400 mb-6 max-w-md mx-auto">
            {filter === "all"
              ? "You haven't purchased any datasets yet. Explore the marketplace to find data."
              : `You don't have any ${filter} downloads.`}
          </p>
          <Link href="/marketplace">
            <Button variant="primary" size="lg">
              <Search className="w-5 h-5" />
              Browse Marketplace
            </Button>
          </Link>
        </div>
      )}

      {/* Storage Info */}
      {filteredDownloads.length > 0 && (
        <div className="glass-card p-6 rounded-lg border border-info/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-sm text-white mb-2 font-bold">
                Access & Storage
              </p>
              <ul className="space-y-1">
                {[
                  "Your access tokens (NFTs) are stored in your wallet",
                  "You can view purchased datasets anytime",
                  "Access status depends on whether the dataset is still listed",
                  "Datasets may be unlisted by the owner",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-success mt-0.5 shrink-0" />
                    <span className="font-mono text-xs text-gray-400 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadsTab;