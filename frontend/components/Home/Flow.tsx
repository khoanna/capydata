import React from 'react'
import { FileUp, Container, Banknote } from "lucide-react";

const Flow = () => {
  return (
     <section id="flow" className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-linear(to_right,#80808012_1px,transparent_1px),linear-linear(to_bottom,#80808012_1px,transparent_1px)] bg-size[24px_24px] mask-image-gradient"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 reveal">
                <div>
                    <div className="font-mono text-yuzu text-xs mb-2 tracking-widest">PROCESS_FLOW</div>
                    <h2 className="text-3xl md:text-5xl font-sans font-bold text-white">THE PIPELINE</h2>
                </div>
                <p className="font-mono text-gray-500 text-sm max-w-sm text-right">From raw bytes to liquid assets in three atomic steps.</p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-white/5 z-0 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-linear-to-r from-transparent via-yuzu to-transparent animate-[slide-right_4s_ease-in-out_infinite]"></div>
                </div>

                <div className="relative group z-10 reveal delay-100">
                    <div className="w-24 h-24 bg-void border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:border-yuzu group-hover:shadow-[0_0_30px_rgba(255,159,28,0.2)] transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-panel rounded-2xl translate-x-2 translate-y-2 -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"></div>
                        <FileUp className="w-10 h-10 text-gray-400 group-hover:text-yuzu transition-colors" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-panel border border-white/10 rounded flex items-center justify-center font-mono text-xs text-yuzu font-bold">01</div>
                    </div>
                    <h3 className="text-2xl font-sans font-bold text-white mb-3 group-hover:text-yuzu transition-colors">Seal & Upload</h3>
                    <p className="font-mono text-xs text-gray-400 leading-relaxed pr-8">
                        Data is encrypted client-side using <span className="text-white">Seal</span> protocol, then sharded into blobs.
                    </p>
                </div>

                <div className="relative group z-10 reveal delay-200">
                    <div className="w-24 h-24 bg-void border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:border-hydro group-hover:shadow-[0_0_30px_rgba(78,205,196,0.2)] transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-panel rounded-2xl translate-x-2 translate-y-2 -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"></div>
                        <Container className="w-10 h-10 text-gray-400 group-hover:text-hydro transition-colors" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-panel border border-white/10 rounded flex items-center justify-center font-mono text-xs text-hydro font-bold">02</div>
                    </div>
                    <h3 className="text-2xl font-sans font-bold text-white mb-3 group-hover:text-hydro transition-colors">Store on Walrus</h3>
                    <p className="font-mono text-xs text-gray-400 leading-relaxed pr-8">
                        Blobs are permanently stored on the <span className="text-white">Walrus</span> decentralized storage network.
                    </p>
                </div>

                <div className="relative group z-10 reveal delay-300">
                    <div className="w-24 h-24 bg-void border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:border-grass group-hover:shadow-[0_0_30px_rgba(149,214,0,0.2)] transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-panel rounded-2xl translate-x-2 translate-y-2 -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"></div>
                        <Banknote className="w-10 h-10 text-gray-400 group-hover:text-grass transition-colors" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-panel border border-white/10 rounded flex items-center justify-center font-mono text-xs text-grass font-bold">03</div>
                    </div>
                    <h3 className="text-2xl font-sans font-bold text-white mb-3 group-hover:text-grass transition-colors">Earn</h3>
                    <p className="font-mono text-xs text-gray-400 leading-relaxed pr-8">
                        Get paid in CAPY instantly when users decrypt your blobs.
                    </p>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Flow