import React from "react";
import { Globe2, ArrowUpRight, BarChart2, MessageSquare, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
const DATASET_ID_1 = "0xc49e9ab0e621190a8d364607115c37a6e58c20cce5d98c31204a757a6b00ebb8";
const DATASET_ID_2 = "0x61507290378f4449c0f91665fefda415478dabfb02c410f80fab28f32960e435";
const DATASET_ID_3 = "0x3ea1ee712d0e8cbaa65c6ea70e7cd06b0750e2b3d7715c107c41d221ee6952e2";
const DATASET_ID_4 = "0x056d1a7423a05b609f7a9db8ae45245ff2658c9437d0d70dbf7413d9482098ee";

const TopDataset = () => {
  const router = useRouter();
  const { allListings } = useAppContext();
  const listing1 = allListings?.find((listing) => listing.id.id === DATASET_ID_1);
  const listing2 = allListings?.find((listing) => listing.id.id === DATASET_ID_2);
  const listing3 = allListings?.find((listing) => listing.id.id === DATASET_ID_3);
  const listing4 = allListings?.find((listing) => listing.id.id === DATASET_ID_4);
  return (
    <section id="top" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 reveal gap-4">
          <div>
            <h2 className="text-4xl font-sans font-bold mb-2 flex items-center gap-3">
                TOP DATASETS
              <span className="text-sm font-mono font-normal text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                LIVE
              </span>
            </h2>
            <p className="font-mono text-gray-500 text-sm max-w-md">
              High-quality data streams curated by the community. Dive in.
            </p>
          </div>
        </div>

        {/* Bento Grid - 3 columns × 2 rows, 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px] reveal delay-100">

          {/* Card 01: Tall Card (1 col × 2 rows) - Students Performance in Exams */}
          <div className="md:row-span-2 glass-panel p-8 rounded-2xl hover-capy transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer" onClick={() => router.push(`item/${DATASET_ID_1}`)}>
            <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe2 className="w-48 h-48 text-hydro" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col gap-2 mb-4">
                <span className="text-6xl font-sans font-bold text-white/10 leading-none">01</span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-hydro/20 text-hydro border border-hydro/30 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                    Bestseller
                  </span>
                  <span className="px-2 py-1 bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                    Real-Time
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-sans font-bold mb-3 group-hover:text-hydro transition-colors leading-tight">
                {listing1?.title}
              </h3>
              <p className="text-gray-400 font-mono text-xs leading-relaxed">
                {listing1?.description}
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-end gap-1 h-8 mb-4 opacity-50">
                <div className="w-1.5 bg-hydro h-[40%] rounded-t-sm"></div>
                <div className="w-1.5 bg-hydro h-[50%] rounded-t-sm"></div>
                <div className="w-1.5 bg-hydro h-[80%] rounded-t-sm"></div>
                <div className="w-1.5 bg-hydro h-[60%] rounded-t-sm"></div>
                <div className="w-1.5 bg-hydro h-[90%] rounded-t-sm animate-pulse"></div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Price
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {formatPrice(listing1?.price || 0)}
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-hydro transition-colors" />
              </div>
            </div>
          </div>

          {/* Card 02: Wide Card (2 cols × 1 row) - {listing2?.title} */}
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 group cursor-pointer relative overflow-hidden flex items-center gap-6" onClick={() => router.push(`item/${DATASET_ID_2}`)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-yuzu/10 blur-3xl rounded-full"></div>

            <div className="w-16 h-16 bg-yuzu/10 border border-yuzu/20 rounded-xl flex items-center justify-center text-yuzu shrink-0">
              <BarChart2 className="w-8 h-8" />
            </div>

            <div className="flex-1 relative z-10">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-sans font-bold text-white/10 leading-none">02</span>
                  <h4 className="font-sans font-bold text-xl group-hover:text-yuzu transition-colors">
                    {listing2?.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-900/30 shrink-0">
                  HOT
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <p className="font-mono text-xs text-gray-400 leading-relaxed max-w-md">
                  {listing2?.description}
                </p>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs text-gray-500 mb-1">Latency: 12ms</div>
                  <div className="font-mono text-xl font-bold text-white">{formatPrice(listing2?.price || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 03: Small Card (1 col × 1 row) - Social Sentiment */}
          <div className="glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden" onClick={() => router.push(`item/${DATASET_ID_3}`)}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <span className="text-4xl font-sans font-bold text-white/10 leading-none">03</span>
                <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                  POPULAR
                </span>
              </div>

              <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>

              <h4 className="font-sans font-bold text-base group-hover:text-purple-400 transition-colors mb-2">
                {listing3?.title}
              </h4>
              <p className="font-mono text-xs text-gray-400">
                {listing3?.description}
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-3 mt-auto">
              {/* <span className="font-mono text-xs text-gray-500">/month</span> */}
              <span className="font-mono text-lg font-bold text-white">{formatPrice(listing3?.price || 0)}</span>
            </div>
          </div>

          {/* Card 04: Small Card (1 col × 1 row) - Stock Market */}
          <div className="glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden" onClick={() => router.push(`item/${DATASET_ID_4}`)}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-grass/10 blur-2xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <span className="text-4xl font-sans font-bold text-white/10 leading-none">04</span>
              </div>

              <div className="w-10 h-10 bg-grass/10 border border-grass/20 rounded-lg flex items-center justify-center text-grass mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>

              <h4 className="font-sans font-bold text-base group-hover:text-grass transition-colors mb-2">
                {listing4?.title}
              </h4>
              <p className="font-mono text-xs text-gray-400">
                {listing4?.description}
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-3 mt-auto">
              <span className="font-mono text-xs text-gray-500">Live Stream</span>
              <span className="font-mono text-lg font-bold text-white">{formatPrice(listing4?.price || 0)}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TopDataset;
