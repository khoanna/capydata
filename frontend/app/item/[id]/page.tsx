"use client";

import { use } from "react";
import { getAssetById } from "@/lib/mockData";
import { notFound } from "next/navigation";
import AssetHeader from "@/components/ItemDetail/AssetHeader";
import ProvenanceGraph from "@/components/ItemDetail/ProvenanceGraph";
import DataInspector from "@/components/ItemDetail/DataInspector";
import FinancialModule from "@/components/ItemDetail/FinancialModule";
import Link from "next/link";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const asset = getAssetById(id);

  if (!asset) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-28 pb-20 bg-void">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 font-mono text-xs text-gray-400 reveal">
          <Link href="/" className="hover:text-yuzu transition-colors">
            Home
          </Link>
          <i data-lucide="chevron-right" className="w-3 h-3"></i>
          <Link href="/marketplace" className="hover:text-yuzu transition-colors">
            Marketplace
          </Link>
          <i data-lucide="chevron-right" className="w-3 h-3"></i>
          <span className="text-white">{asset.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Asset Header */}
            <AssetHeader asset={asset} />

            {/* Data Inspector */}
            <DataInspector asset={asset} />

            {/* Provenance Graph */}
            <ProvenanceGraph did={asset.did} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <FinancialModule asset={asset} />
          </div>
        </div>

        {/* Related Assets */}
        <div className="mt-16 reveal delay-400">
          <h2 className="text-3xl font-sans font-bold text-white mb-6 flex items-center gap-2">
            <i data-lucide="sparkles" className="w-6 h-6 text-yuzu"></i>
            Similar Datasets
          </h2>
          <p className="font-mono text-sm text-gray-400 mb-6">
            Explore more datasets in the same category
          </p>
          <Link href="/marketplace">
            <button className="px-6 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all font-mono text-sm text-white flex items-center gap-2 group">
              Browse Marketplace
              <i data-lucide="arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
