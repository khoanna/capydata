import Image from "next/image";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <main className="relative pt-32 pb-20 border-b border-white/5 min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yuzu/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-hydro/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-yuzu/30 rounded-full bg-yuzu/5 text-yuzu font-mono text-xs font-bold tracking-wide reveal">
              <span className="w-2 h-2 rounded-full bg-yuzu animate-pulse"></span>
              MARKETPLACE V3.0 LIVE
            </div>

            <h1 className="text-6xl md:text-8xl font-sans font-bold leading-[0.9] tracking-tight reveal delay-100 text-white">
              YOUR DATA.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-yuzu to-capy-brown">
                YOUR ASSET.
              </span>
            </h1>

            <p className="font-mono text-gray-400 max-w-lg text-sm md:text-base leading-relaxed reveal delay-200">
              The world's first <strong className="text-white">fully decentralized data marketplace</strong> powered by Seal encryption and Walrus storage. Buy, sell, and monetize datasets with complete ownership and zero platform fees.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 reveal delay-300">
              <button className="bg-yuzu text-black px-8 py-4 rounded-lg font-bold font-mono text-sm hover:bg-white hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,159,28,0.4)]">
                BROWSE DATASETS{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 border border-white/20 rounded-lg font-mono text-sm hover:border-hydro hover:text-hydro transition-colors bg-black/40 backdrop-blur-sm">
                LIST YOUR DATA
              </button>
            </div>

            <div className="flex items-center gap-4 pt-4 opacity-60 reveal delay-500">
              <span className="font-mono text-sm text-gray-500 uppercase">
                Built on:
              </span>
              <div className="flex gap-2 font-mono text-xs text-gray-400">
                <span className="border border-white/10 px-2 py-1 rounded">
                  SUI
                </span>
                <span className="border border-white/10 px-2 py-1 rounded">
                  WALRUS
                </span>
                <span className="border border-white/10 px-2 py-1 rounded">
                  SEAL
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-[500px] flex items-center justify-center reveal delay-300 order-1 lg:order-2">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              {/* Main Capybara Container with Extreme Hover Effects */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-yuzu/50 shadow-[0_0_60px_rgba(255,159,28,0.3)] animate-float group
                hover:border-yuzu hover:border-[6px] hover:shadow-[0_0_120px_rgba(255,159,28,0.8),0_0_200px_rgba(78,205,196,0.5),0_0_280px_rgba(149,214,0,0.3)]
                hover:scale-[1.08] hover:-translate-y-3 hover:rotate-[0.5deg] hover:animate-[rainbow-glow_3s_ease-in-out_infinite]
                transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                will-change-transform origin-center">

                <Image
                  src="/capybara.png"
                  alt="Cyber Capybara"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] grayscale-20 contrast-125
                    group-hover:grayscale-0 group-hover:contrast-110 group-hover:brightness-110 group-hover:saturate-150 group-hover:scale-[1.03]"
                />

                {/* Scanlines - Enhanced on hover */}
                <div className="absolute inset-0 bg-[linear-linear(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-size-[100%_2px,3px_100%] pointer-events-none
                  group-hover:opacity-50 transition-opacity duration-[800ms]"></div>

                {/* Gradient Overlay - Intensified on hover */}
                <div className="absolute inset-0 bg-linear-to-tr from-yuzu/20 via-transparent to-hydro/20 mix-blend-overlay z-20
                  group-hover:from-yuzu/60 group-hover:to-hydro/60 transition-all duration-[800ms]"></div>

                {/* NEW: Shine Sweep Effect */}
                <div className="absolute top-0 w-[40%] h-full bg-linear-to-r from-transparent via-white/0 to-transparent z-25 opacity-0 pointer-events-none
                  transition-opacity duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                  group-hover:opacity-100 group-hover:animate-[shine-sweep_2s_ease-in-out_infinite]"></div>

                {/* NEW: Energy Particles (corners) */}
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yuzu/0 z-35 opacity-0
                  transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group-hover:opacity-100 group-hover:bg-yuzu group-hover:shadow-[0_0_20px_#FF9F1C] group-hover:animate-[energy-pulse_1.5s_ease-in-out_infinite]"></div>
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-hydro/0 z-35 opacity-0
                  transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-100
                  group-hover:opacity-100 group-hover:bg-hydro group-hover:shadow-[0_0_20px_#4ECDC4] group-hover:animate-[energy-pulse_1.5s_ease-in-out_infinite_0.3s]"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-grass/0 z-35 opacity-0
                  transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-200
                  group-hover:opacity-100 group-hover:bg-grass group-hover:shadow-[0_0_20px_#95D600] group-hover:animate-[energy-pulse_1.5s_ease-in-out_infinite_0.6s]"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-capy-brown/0 z-35 opacity-0
                  transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-300
                  group-hover:opacity-100 group-hover:bg-capy-brown group-hover:shadow-[0_0_20px_#C69C6D] group-hover:animate-[energy-pulse_1.5s_ease-in-out_infinite_0.9s]"></div>

                {/* NEW: Power-Up Radial Pulse */}
                <div className="absolute inset-0 rounded-3xl bg-radial-at-center from-yuzu/0 via-transparent to-transparent z-5 opacity-0 pointer-events-none
                  transition-opacity duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                  group-hover:opacity-100 group-hover:animate-[power-up_2s_ease-out_infinite]"></div>

                {/* NEW: Rainbow Border Animation (pseudo-element effect via multiple borders) */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent z-45 opacity-0 pointer-events-none
                  transition-opacity duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                  group-hover:opacity-100 group-hover:animate-[rainbow-border_4s_linear_infinite]"></div>

                <div className="absolute top-4 left-4 z-40 flex gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping
                    transition-all duration-[500ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                    group-hover:bg-yuzu group-hover:shadow-[0_0_10px_#FF9F1C]"></div>
                  <span className="font-mono text-[10px] text-white font-bold tracking-widest bg-black/50 px-2 rounded border border-white/10
                    transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                    group-hover:bg-yuzu/20 group-hover:border-yuzu group-hover:text-yuzu">
                    LIVE FEED
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 z-40 font-mono text-[10px] text-yuzu bg-black/80 px-3 py-1 rounded border border-yuzu/30 backdrop-blur-md
                  transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                  group-hover:bg-yuzu/20 group-hover:border-yuzu group-hover:shadow-[0_0_20px_rgba(255,159,28,0.5)]">
                  &gt; SUBJECT: CAPY_01
                  <br />
                  &gt; CHILL_FACTOR: <span className="transition-all duration-[400ms] group-hover:text-white group-hover:font-extrabold">MAX</span>
                </div>
              </div>

              {/* Orbital Rings - Activated on hover */}
              <div className="absolute -z-10 w-[120%] h-[120%] border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite]
                group-hover:border-solid group-hover:border-yuzu/60 group-hover:animate-[spin_5s_linear_infinite] group-hover:shadow-[0_0_30px_rgba(255,159,28,0.4)]
                transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
              <div className="absolute -z-10 w-[110%] h-[110%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]
                group-hover:border-hydro/60 group-hover:animate-[spin_4s_linear_infinite_reverse] group-hover:shadow-[0_0_30px_rgba(78,205,196,0.4)]
                transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>

              {/* NEW: Additional Orbital Rings (appear on hover) */}
              <div className="absolute -z-10 w-[130%] h-[130%] border-2 border-transparent rounded-full opacity-0
                group-hover:opacity-100 group-hover:border-grass/40 group-hover:animate-[spin_3s_linear_infinite] group-hover:shadow-[inset_0_0_20px_rgba(149,214,0,0.3)]
                transition-all duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
              <div className="absolute -z-10 w-[105%] h-[105%] border border-transparent rounded-full opacity-0
                group-hover:opacity-100 group-hover:animate-[orbital-glow_2s_ease-in-out_infinite]
                transition-opacity duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>

              {/* <div className="absolute -right-6 bottom-12 bg-panel border border-yuzu/30 p-4 rounded-xl shadow-xl backdrop-blur-md animate-[float_4s_ease-in-out_infinite_reverse] z-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yuzu/10 rounded-full flex items-center justify-center text-yuzu">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-gray-400">
                      Verification
                    </div>
                    <div className="text-sm font-sans font-bold text-white">
                      100% Secure
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
