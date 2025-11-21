import React from 'react'

const Stats = () => {
  return (
    <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            <div className="p-8 text-center hover:bg-white/5 transition-colors group cursor-default">
                <div className="font-mono text-xs text-gray-500 mb-2 group-hover:text-yuzu uppercase tracking-widest">Total Liquidity</div>
                <div className="font-sans text-3xl font-bold text-yuzu">$42.5M</div>
            </div>
            <div className="p-8 text-center hover:bg-white/5 transition-colors group cursor-default">
                <div className="font-mono text-xs text-gray-500 mb-2 group-hover:text-hydro uppercase tracking-widest">Data Products</div>
                <div className="font-sans text-3xl font-bold text-hydro">12,400</div>
            </div>
            <div className="p-8 text-center hover:bg-white/5 transition-colors group cursor-default">
                <div className="font-mono text-xs text-gray-500 mb-2 group-hover:text-grass uppercase tracking-widest">Verified Sellers</div>
                <div className="font-sans text-3xl font-bold text-grass">850+</div>
            </div>
            <div className="p-8 text-center hover:bg-white/5 transition-colors group cursor-default">
                <div className="font-mono text-xs text-gray-500 mb-2 group-hover:text-capy-brown uppercase tracking-widest">Uptime</div>
                <div className="font-sans text-3xl font-bold text-capy-brown">99.99%</div>
            </div>
        </div>
    </section>
  )
}

export default Stats