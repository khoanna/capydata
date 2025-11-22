import React from "react";
import { Database, Citrus, Users, Zap } from "lucide-react";

interface FooterSlideProps {
  transparent?: boolean;
}

const FooterSlide = ({ transparent = false }: FooterSlideProps) => {
  return (
    <div className={`fixed bottom-0 w-full z-40 ${transparent ? "border-t-transparent bg-transparent" : "border-t border-white/10 bg-void/90"} backdrop-blur-sm font-mono text-xs py-2 overflow-hidden flex items-center`}>
      <div className="whitespace-nowrap animate-marquee flex gap-12 text-gray-500">
        <span className="flex items-center gap-2">
          <Database className="w-3 h-3 text-hydro" />{" "}
          24H_VOLUME: <span className="text-white">420 TB</span>
        </span>
        <span className="flex items-center gap-2">
          <Citrus className="w-3 h-3 text-yuzu" /> SUI_TOKEN:{" "}
          <span className="text-yuzu">$4.50</span>
        </span>
        <span className="flex items-center gap-2">
          <Users className="w-3 h-3 text-grass" />{" "}
          ACTIVE_NODES: <span className="text-grass">8,000+</span>
        </span>
        <span className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-yuzu" /> GAS_FEES:{" "}
          <span className="text-white">0.0001 ETH (LOW)</span>
        </span>
        <span className="flex items-center gap-2">
          LATEST_SALE:{" "}
          <span className="text-white">
            Global_Weather_V2 sold for 500 SUI
          </span>
        </span>
        <span className="flex items-center gap-2">
          <Database className="w-3 h-3 text-hydro" />{" "}
          24H_VOLUME: <span className="text-white">420 TB</span>
        </span>
        <span className="flex items-center gap-2">
          <Citrus className="w-3 h-3 text-yuzu" /> SUI_TOKEN:{" "}
          <span className="text-yuzu">$4.50</span>
        </span>
        <span className="flex items-center gap-2">
          <Users className="w-3 h-3 text-grass" />{" "}
          ACTIVE_NODES: <span className="text-grass">8,000+</span>
        </span>
      </div>
    </div>
  );
};

export default FooterSlide;
