"use client";

import { useState } from "react";
import { mockAssets } from "@/lib/mockData";
import { formatPrice, timeAgo } from "@/lib/utils";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import Link from "next/link";

interface DownloadsTabProps {
  address: string;
}

interface Download {
  id: string;
  assetId: string;
  assetTitle: string;
  purchaseDate: Date;
  price: number;
  txHash: string;
  downloadCount: number;
  lastDownloaded?: Date;
  status: "active" | "expired";
}

const DownloadsTab = ({ address }: DownloadsTabProps) => {
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  // Mock user's downloads
  const mockDownloads: Download[] = mockAssets.slice(0, 5).map((asset, i) => ({
    id: `download-${i}`,
    assetId: asset.id,
    assetTitle: asset.title,
    purchaseDate: new Date(Date.now() - i * 86400000 * 7),
    price: asset.price,
    txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
    downloadCount: Math.floor(Math.random() * 10) + 1,
    lastDownloaded: new Date(Date.now() - i * 86400000),
    status: i > 3 ? "expired" : "active",
  }));

  const filteredDownloads = mockDownloads.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const totalSpent = mockDownloads.reduce((sum, d) => sum + d.price, 0);
  const activeAccess = mockDownloads.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-lg">
          <p className="font-mono text-xs text-gray-400 mb-2">Total Purchased</p>
          <p className="font-sans text-3xl font-bold text-white">
            {mockDownloads.length}
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
            <span className="text-sm ml-1">CAPY</span>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { value: "all" as const, label: "All", count: mockDownloads.length },
          { value: "active" as const, label: "Active", count: activeAccess },
          {
            value: "expired" as const,
            label: "Expired",
            count: mockDownloads.length - activeAccess,
          },
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
      {filteredDownloads.length > 0 ? (
        <div className="space-y-4">
          {filteredDownloads.map((download) => (
            <div
              key={download.id}
              className="glass-card p-6 rounded-lg hover:border-yuzu/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Asset Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-bold text-white mb-1">
                        {download.assetTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-gray-400">
                          Purchased {timeAgo(download.purchaseDate)}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="font-mono text-gray-400">
                          {formatPrice(download.price)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={download.status === "active" ? "success" : "error"}
                      size="sm"
                    >
                      {download.status === "active" ? "Active" : "Expired"}
                    </Badge>
                  </div>

                  {/* Download Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <i data-lucide="download" className="w-3 h-3 text-gray-500"></i>
                      <span className="font-mono text-xs text-gray-500">
                        {download.downloadCount} download{download.downloadCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {download.lastDownloaded && (
                      <>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center gap-2">
                          <i data-lucide="clock" className="w-3 h-3 text-gray-500"></i>
                          <span className="font-mono text-xs text-gray-500">
                            Last accessed {timeAgo(download.lastDownloaded)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Transaction Hash */}
                  <a
                    href={`https://suiscan.xyz/testnet/tx/${download.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-hydro hover:underline flex items-center gap-1"
                  >
                    TX: {download.txHash.slice(0, 10)}...{download.txHash.slice(-8)}
                    <i data-lucide="external-link" className="w-3 h-3"></i>
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {download.status === "active" ? (
                    <>
                      <Button variant="primary" size="sm">
                        <i data-lucide="download" className="w-4 h-4"></i>
                        Download
                      </Button>
                      <Link href={`/item/${download.assetId}`}>
                        <Button variant="ghost" size="sm">
                          <i data-lucide="eye" className="w-4 h-4"></i>
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href={`/item/${download.assetId}`}>
                      <Button variant="outline" size="sm">
                        <i data-lucide="rotate-ccw" className="w-4 h-4"></i>
                        Renew Access
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-lg text-center">
          <i data-lucide="inbox" className="w-16 h-16 text-gray-600 mx-auto mb-4"></i>
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
              <i data-lucide="search" className="w-5 h-5"></i>
              Browse Marketplace
            </Button>
          </Link>
        </div>
      )}

      {/* Storage Info */}
      {filteredDownloads.length > 0 && (
        <div className="glass-card p-6 rounded-lg border border-info/30">
          <div className="flex items-start gap-3">
            <i data-lucide="info" className="w-5 h-5 text-info flex-shrink-0 mt-0.5"></i>
            <div>
              <p className="font-mono text-sm text-white mb-2 font-bold">
                Access & Storage
              </p>
              <ul className="space-y-1">
                {[
                  "Your access tokens are stored in your wallet",
                  "Download datasets anytime while access is active",
                  "Access may expire based on the seller's terms",
                  "Renew expired access by purchasing again",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <i data-lucide="check" className="w-3 h-3 text-success mt-0.5 flex-shrink-0"></i>
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
