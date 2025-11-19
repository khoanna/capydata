"use client";

import { use, useState } from "react";
import IdentityHeader from "@/components/Profile/IdentityHeader";
import PublishedTab from "@/components/Profile/PublishedTab";
import DownloadsTab from "@/components/Profile/DownloadsTab";
import FinancialsTab from "@/components/Profile/FinancialsTab";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const [activeTab, setActiveTab] = useState<"published" | "downloads" | "financials">("published");

  const tabs = [
    { id: "published" as const, label: "Published", icon: "upload-cloud" },
    { id: "downloads" as const, label: "Downloads", icon: "download" },
    { id: "financials" as const, label: "Financials", icon: "trending-up" },
  ];

  return (
    <main className="min-h-screen pt-28 pb-20 bg-void">
      <div className="max-w-7xl mx-auto px-6">
        {/* Identity Header */}
        <IdentityHeader address={address} />

        {/* Tabs */}
        <div className="mb-8 reveal delay-200">
          <div className="flex items-center gap-2 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-mono text-sm transition-all relative ${
                  activeTab === tab.id
                    ? "text-yuzu"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <i data-lucide={tab.icon} className="w-4 h-4"></i>
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yuzu"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="reveal delay-300">
          {activeTab === "published" && <PublishedTab address={address} />}
          {activeTab === "downloads" && <DownloadsTab address={address} />}
          {activeTab === "financials" && <FinancialsTab address={address} />}
        </div>
      </div>
    </main>
  );
}
