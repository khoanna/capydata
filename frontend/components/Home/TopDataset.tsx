import React from "react";
import { Globe2, ArrowUpRight, BarChart2, MessageSquare } from "lucide-react";

const TopDataset = () => {
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

          {/* <div className="flex gap-2 bg-panel border border-white/10 p-1 rounded-lg">
            <button className="px-4 py-2 bg-white/10 rounded text-xs font-mono font-bold hover:bg-white/20 transition-colors">
              TRENDING
            </button>
            <button className="px-4 py-2 text-gray-500 rounded text-xs font-mono hover:text-white hover:bg-white/5 transition-colors">
              NEW ARRIVALS
            </button>
            <button className="px-4 py-2 text-gray-500 rounded text-xs font-mono hover:text-white hover:bg-white/5 transition-colors">
              FREE
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px] reveal delay-100">
          <div className="md:col-span-2 md:row-span-2 glass-panel p-8 rounded-2xl hover-capy transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer">
            <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe2 className="w-64 h-64 text-hydro" />
            </div>

            <div className="relative z-10">
              <div className="flex gap-2 mb-6">
                <span className="px-2 py-1 bg-hydro/20 text-hydro border border-hydro/30 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                  Bestseller
                </span>
                <span className="px-2 py-1 bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                  Real-Time
                </span>
              </div>
              <h3 className="text-3xl font-sans font-bold mb-2 group-hover:text-hydro transition-colors">
                Global AI Training Set: Climate
              </h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed mt-4">
                A massive, clean dataset of global temperature, humidity, and
                wind patterns from over 50,000 sensors. Perfect for training
                LLMs on weather prediction.
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <div className="flex items-end gap-1 h-12 mb-6 opacity-50">
                <div className="w-2 bg-hydro h-[40%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[50%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[80%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[60%] rounded-t-sm"></div>
                <div className="w-2 bg-hydro h-[90%] rounded-t-sm animate-pulse"></div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Price
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    1,200 CAPY
                  </div>
                </div>
                <button className="h-12 px-6 rounded-lg bg-white text-black font-bold font-mono text-xs hover:bg-hydro hover:text-white transition-colors flex items-center gap-2">
                  VIEW DETAILS{" "}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yuzu/10 blur-2xl rounded-full"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-yuzu/10 border border-yuzu/20 rounded-lg flex items-center justify-center text-yuzu">
                <BarChart2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-green-400 flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded border border-green-900/30">
                HOT
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="font-sans font-bold text-lg mt-4 group-hover:text-yuzu transition-colors">
                DeFi Arbitrage Feed
              </h4>
              <div className="flex justify-between items-end mt-4">
                <span className="font-mono text-xs text-gray-500">
                  Latency: 12ms
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  500 CAPY
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl rounded-full"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                POPULAR
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="font-sans font-bold text-lg mt-4 group-hover:text-purple-400 transition-colors">
                Social Sentiment API
              </h4>
              <div className="flex justify-between items-end mt-4">
                <span className="font-mono text-xs text-gray-500">
                  Twitter/X + Reddit
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  200 CAPY/mo
                </span>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl rounded-full"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                POPULAR
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="font-sans font-bold text-lg mt-4 group-hover:text-purple-400 transition-colors">
                Social Sentiment API
              </h4>
              <div className="flex justify-between items-end mt-4">
                <span className="font-mono text-xs text-gray-500">
                  Twitter/X + Reddit
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  200 CAPY/mo
                </span>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl hover-capy transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl rounded-full"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                POPULAR
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="font-sans font-bold text-lg mt-4 group-hover:text-purple-400 transition-colors">
                Social Sentiment API
              </h4>
              <div className="flex justify-between items-end mt-4">
                <span className="font-mono text-xs text-gray-500">
                  Twitter/X + Reddit
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  200 CAPY/mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopDataset;
