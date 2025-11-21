"use client";

import { useEffect, useState } from "react";

interface DatasetMetadata {
  name: string;
  category: string;
  size: string;
  price: string;
  downloads: number;
  quality: string;
}

interface Props {
  dataset: DatasetMetadata | null;
  screenPosition: { x: number; y: number } | null;
  scale: number;
  onClose: () => void;
}

export default function PlanetMetadataOverlay({ dataset, screenPosition, scale, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (dataset) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [dataset]);

  if (!dataset || !screenPosition) return null;

  const adjustedScale = Math.max(0.3, Math.min(1, scale));

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        transform: `translate(-50%, -50%) scale(${adjustedScale})`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
      }}
    >
      <div
        className={`relative transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        style={{
          transformOrigin: 'center',
        }}
      >
        {/* Futuristic Container */}
        <div className="relative bg-gradient-to-br from-void/95 to-panel/90 border border-yuzu/50 rounded-lg p-6 min-w-[320px] backdrop-blur-xl shadow-[0_0_40px_rgba(255,159,28,0.4)]">

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yuzu"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yuzu"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yuzu"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yuzu"></div>

          {/* Scan Line Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-yuzu/50 to-transparent animate-scan"></div>
          </div>

          {/* Holographic Flicker */}
          <div className="absolute inset-0 bg-yuzu/5 opacity-30 animate-flicker pointer-events-none rounded-lg"></div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yuzu/20 border border-yuzu/50 flex items-center justify-center text-yuzu hover:bg-yuzu/40 transition-all pointer-events-auto z-10"
          >
            ×
          </button>

          {/* Header */}
          <div className="mb-4 pb-3 border-b border-yuzu/30">
            <h3 className="font-sans text-lg font-bold text-yuzu mb-1 tracking-wide">
              {dataset.name}
            </h3>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              {dataset.category}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-3">
            {/* Size */}
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-gray-500 uppercase">Storage</span>
              <span className="font-mono text-sm text-hydro font-bold">{dataset.size}</span>
            </div>

            {/* Price */}
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-gray-500 uppercase">Price</span>
              <span className="font-mono text-sm text-yuzu font-bold">{dataset.price}</span>
            </div>

            {/* Downloads */}
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-gray-500 uppercase">Downloads</span>
              <span className="font-mono text-sm text-white font-bold">
                {dataset.downloads.toLocaleString()}
              </span>
            </div>

            {/* Quality Badge */}
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-gray-500 uppercase">Status</span>
              <span className={`font-mono text-xs px-2 py-1 rounded border ${
                dataset.quality === 'Premium'
                  ? 'bg-yuzu/20 border-yuzu/50 text-yuzu'
                  : dataset.quality === 'Live Feed'
                  ? 'bg-grass/20 border-grass/50 text-grass animate-pulse'
                  : 'bg-hydro/20 border-hydro/50 text-hydro'
              }`}>
                {dataset.quality}
              </span>
            </div>
          </div>

          {/* Data Stream Animation */}
          <div className="mt-4 h-12 rounded bg-black/40 border border-yuzu/20 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[8px] text-yuzu/50 overflow-hidden">
              <div className="animate-datastream">
                01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-yuzu/50 animate-progress"></div>
          </div>

          {/* Action Button */}
          <button className="mt-4 w-full py-3 bg-yuzu/10 border border-yuzu/30 rounded hover:bg-yuzu/20 hover:border-yuzu transition-all font-mono text-sm text-yuzu font-bold pointer-events-auto">
            ACCESS DATASET →
          </button>
        </div>

        {/* Connecting Line to Planet */}
        <div className="absolute left-1/2 -bottom-8 w-[2px] h-8 bg-gradient-to-b from-yuzu/50 to-transparent"></div>
      </div>

      {/* Custom Animations in Style Tag */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        @keyframes flicker {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.1;
          }
        }
        @keyframes datastream {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-flicker {
          animation: flicker 2s ease-in-out infinite;
        }
        .animate-datastream {
          animation: datastream 10s linear infinite;
          white-space: nowrap;
        }
        .animate-progress {
          animation: progress 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
