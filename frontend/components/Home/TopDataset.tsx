import React from "react";
import { Globe2, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";


const TopDataset = () => {
  const router = useRouter();
  const { allListings } = useAppContext();
  
  // Take top 4 listings by amount_sold (most popular)
  const topDatasets = allListings
    ?.sort((a, b) => (b.amount_sold || 0) - (a.amount_sold || 0))
    .slice(0, 4) || [];
  const [listing1, listing2, listing3, listing4] = topDatasets;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] reveal delay-100">

          {/* Card 01: Tall Card (1 col × 2 rows) - Students Performance in Exams */}
          <div className="md:row-span-2 glass-panel p-10 rounded-2xl hover-capy transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer" onClick={() => listing1 && router.push(`item/?id=${listing1.id.id}`)}>
            <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe2 className="w-48 h-48 text-hydro" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col gap-3 mb-6">
                <span className="text-7xl font-sans font-bold text-white/10 leading-none">01</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-hydro/20 text-hydro border border-hydro/30 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                    Bestseller
                  </span>
                  <span className="px-3 py-1.5 bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                    {listing1?.amount_sold || 0} Sales
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-sans font-bold mb-4 group-hover:text-hydro transition-colors leading-tight">
                {listing1?.title || "Dataset Title"}
              </h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed line-clamp-4">
                {listing1?.description || "No description available"}
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-end gap-1.5 h-10 mb-6 opacity-50">
                <div className="w-2 bg-hydro h-[40%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[50%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[80%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[60%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[90%] rounded-t-sm animate-pulse"></div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-5">
                <div>
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                    Price
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {formatPrice(listing1?.price || 0)}
                  </div>
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-hydro transition-colors" />
              </div>
            </div>
          </div>

          {/* Card 02: Wide Card (2 cols × 1 row) - {listing2?.title} */}
          <div className="md:col-span-2 glass-panel p-8 rounded-2xl hover-capy transition-all duration-300 group cursor-pointer relative overflow-hidden" onClick={() => listing2 && router.push(`item/?id=${listing2.id.id}`)}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-yuzu/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-sans font-bold text-white/10 leading-none">02</span>
                  <h4 className="font-sans font-bold text-2xl group-hover:text-yuzu transition-colors">
                    {listing2?.title || "Dataset Title"}
                  </h4>
                </div>
                <span className="text-xs font-mono text-green-400 bg-green-900/20 px-3 py-1.5 rounded border border-green-900/30 shrink-0">
                  {listing2?.amount_sold || 0} Sales
                </span>
              </div>

              <div className="flex items-end justify-between gap-6">
                <p className="font-mono text-sm text-gray-400 leading-relaxed max-w-2xl line-clamp-2">
                  {listing2?.description || "No description available"}
                </p>
                <div className="text-right shrink-0">
                  <div className="font-mono text-2xl font-bold text-white">{formatPrice(listing2?.price || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 03: Small Card (1 col × 1 row) - Social Sentiment */}
          <div className="glass-panel p-8 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden" onClick={() => listing3 && router.push(`item/?id=${listing3.id.id}`)}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-5xl font-sans font-bold text-white/10 leading-none">03</span>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20">
                  {listing3?.amount_sold || 0} Sales
                </span>
              </div>

              <h4 className="font-sans font-bold text-lg group-hover:text-purple-400 transition-colors mb-3 leading-tight">
                {listing3?.title || "Dataset Title"}
              </h4>
              <p className="font-mono text-sm text-gray-400 leading-relaxed line-clamp-3">
                {listing3?.description || "No description available"}
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4 mt-4">
              <span className="font-mono text-xl font-bold text-white">{formatPrice(listing3?.price || 0)}</span>
            </div>
          </div>

          {/* Card 04: Small Card (1 col × 1 row) - Stock Market */}
          <div className="glass-panel p-8 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden" onClick={() => listing4 && router.push(`item/?id=${listing4.id.id}`)}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-grass/10 blur-2xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-5xl font-sans font-bold text-white/10 leading-none">04</span>
                <span className="text-xs font-mono text-grass bg-grass/10 px-3 py-1 rounded border border-grass/20">
                  {listing4?.amount_sold || 0} Sales
                </span>
              </div>

              <h4 className="font-sans font-bold text-lg group-hover:text-grass transition-colors mb-3 leading-tight">
                {listing4?.title || "Dataset Title"}
              </h4>
              <p className="font-mono text-sm text-gray-400 leading-relaxed line-clamp-3">
                {listing4?.description || "No description available"}
              </p>
            </div>

            <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4 mt-4">
              <span className="font-mono text-xl font-bold text-white">{formatPrice(listing4?.price || 0)}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TopDataset;
