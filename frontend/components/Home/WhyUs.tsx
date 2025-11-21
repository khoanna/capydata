import React from "react";
import { Lock, HardDrive, Fingerprint } from "lucide-react";

const WhyUs = () => {
  return (
    <section
      id="features"
      className="py-24 border-t border-white/5 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-linear-to-l from-hydro/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-hydro/30 rounded mb-6 bg-hydro/5 text-hydro font-mono text-[10px] font-bold tracking-wide">
              POWERED BY SEAL × WALRUS
            </div>
            <h2 className="text-4xl md:text-5xl font-sans font-bold mb-6 leading-tight">
              TRUE <span className="text-hydro">DATA SOVEREIGNTY</span>.
            </h2>
            <p className="font-mono text-gray-400 mb-8 leading-relaxed">
              We don't just store files; we seal them. Built on the cutting-edge{" "}
              <strong className="text-white">Walrus Protocol</strong> for
              storage and <strong className="text-white">Seal</strong> for
              encryption, ensuring your data remains mathematically yours.
            </p>

            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded bg-hydro/10 flex items-center justify-center text-hydro shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white group-hover:text-hydro transition-colors">
                    Seal Encryption
                  </h4>
                  <p className="font-mono text-xs text-gray-500 mt-1 leading-relaxed">
                    Advanced cryptographic enveloping. Data is encrypted before
                    it ever leaves your browser. Only the private key holder can
                    unseal the payload.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded bg-yuzu/10 flex items-center justify-center text-yuzu shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white group-hover:text-yuzu transition-colors">
                    Walrus Storage
                  </h4>
                  <p className="font-mono text-xs text-gray-500 mt-1 leading-relaxed">
                    Next-gen decentralized blob storage. Walrus ensures cheaper,
                    faster, and more reliable availability than legacy IPFS
                    pinning services.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded bg-grass/10 flex items-center justify-center text-grass shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white group-hover:text-grass transition-colors">
                    Sovereign Access
                  </h4>
                  <p className="font-mono text-xs text-gray-500 mt-1 leading-relaxed">
                    No platform lock-in. Your data lives on the Walrus network,
                    independent of the CapyData interface.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative h-[500px] bg-void border border-white/5 rounded-2xl p-8 reveal delay-100 overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hydro/10 blur-[60px] rounded-full animate-pulse"></div>

            <div className="font-mono text-xs text-gray-500 mb-4 flex justify-between">
              <span>ARCHITECTURE_VIEW</span>
              <span className="text-green-500 animate-pulse">● LIVE</span>
            </div>

            <div className="space-y-4 font-mono text-xs relative z-10 mt-10">
              <div className="p-3 border border-white/10 rounded bg-black/40 flex justify-between items-center hover:border-hydro/50 transition-colors">
                <span className="text-gray-400"> init_seal_protocol()</span>
                <span className="text-hydro">OK</span>
              </div>
              <div className="p-3 border border-white/10 rounded bg-black/40 flex justify-between items-center hover:border-yuzu/50 transition-colors">
                <span className="text-gray-400">
                  {" "}
                  connect_walrus_node(0x4a...)
                </span>
                <span className="text-yuzu">CONNECTED</span>
              </div>
              <div className="p-3 border border-white/10 rounded bg-black/40 flex justify-between items-center hover:border-grass/50 transition-colors">
                <span className="text-gray-400">verify_ownership_proof</span>
                <span className="text-grass">VALID</span>
              </div>
            </div>

            <div className="mt-12 space-y-2 opacity-60">
              <div className="flex gap-1">
                <div className="h-1 w-2 bg-hydro rounded-full animate-[blink_2s_infinite]"></div>
                <div className="h-1 w-2 bg-gray-700 rounded-full"></div>
                <div className="h-1 w-2 bg-gray-700 rounded-full"></div>
                <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
              </div>
              <div className="flex gap-1">
                <div className="h-1 w-2 bg-gray-700 rounded-full"></div>
                <div className="h-1 w-2 bg-yuzu rounded-full animate-[blink_3s_infinite]"></div>
                <div className="h-1 w-2 bg-gray-700 rounded-full"></div>
                <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
