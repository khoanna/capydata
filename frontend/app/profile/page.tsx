"use client";

import { useState, Suspense } from "react";
import { UploadCloud, Download, TrendingUp } from "lucide-react";
import { useSearchParams, notFound } from "next/navigation";
import IdentityHeader from "@/components/Profile/IdentityHeader";
import PublishedTab from "@/components/Profile/PublishedTab";
import DownloadsTab from "@/components/Profile/DownloadsTab";
import FinancialsTab from "@/components/Profile/FinancialsTab";

function ProfileContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const [activeTab, setActiveTab] = useState<"published" | "downloads" | "financials">("published");

  if (!address) {
    notFound();
  }

  const tabs = [
    { id: "published" as const, label: "Published", icon: <UploadCloud className="w-4 h-4" /> },
    { id: "downloads" as const, label: "Downloads", icon: <Download className="w-4 h-4" /> },
    { id: "financials" as const, label: "Financials", icon: <TrendingUp className="w-4 h-4" /> },
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
                  {tab.icon}
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

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-28 pb-20 bg-void">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-yuzu border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-mono text-sm text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <ProfileContent />
    </Suspense>
  );
}
