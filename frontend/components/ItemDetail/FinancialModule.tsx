"use client";

import { useState } from "react";
import { Asset } from "@/lib/mockData";
import { formatPrice, capyToUSD, formatUSD } from "@/lib/utils";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import PaymentModal from "./PaymentModal";

interface FinancialModuleProps {
  asset: Asset;
}

const FinancialModule = ({ asset }: FinancialModuleProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock bonding curve data for dynamic pricing
  const mockPriceHistory = [
    { date: "Jan", price: 45 },
    { date: "Feb", price: 48 },
    { date: "Mar", price: 50 },
    { date: "Apr", price: 52 },
    { date: "May", price: 50 },
  ];

  return (
    <>
      <div className="glass-card p-6 sticky top-24 reveal delay-300">
        <h3 className="text-xl font-sans font-bold text-white mb-6 flex items-center gap-2">
          <i data-lucide="credit-card" className="w-5 h-5 text-yuzu"></i>
          Purchase Access
        </h3>

        {/* Price Display */}
        {asset.priceModel === "free" ? (
          <div className="mb-6">
            <Badge variant="success" size="lg" className="w-full justify-center py-4">
              <i data-lucide="gift" className="w-6 h-6"></i>
              <span className="text-lg">FREE ACCESS</span>
            </Badge>
          </div>
        ) : (
          <div className="mb-6">
            <p className="font-mono text-xs text-gray-400 mb-2">Price</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-sans font-bold text-yuzu">
                {asset.price}
              </span>
              <span className="text-xl font-mono text-gray-400">CAPY</span>
            </div>
            <p className="font-mono text-sm text-gray-500">
              ≈ {formatUSD(capyToUSD(asset.price))}
            </p>
          </div>
        )}

        {/* Dynamic Pricing Chart */}
        {asset.priceModel === "dynamic" && (
          <div className="mb-6 p-4 glass-input rounded-lg">
            <p className="font-mono text-xs text-gray-400 mb-3 flex items-center gap-2">
              <i data-lucide="trending-up" className="w-3 h-3"></i>
              Price History (AMM)
            </p>
            <div className="flex items-end justify-between h-20 gap-1">
              {mockPriceHistory.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-yuzu to-hydro rounded-t opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ height: `${(point.price / 60) * 100}%` }}
                    title={`${point.date}: ${point.price} CAPY`}
                  ></div>
                  <span className="font-mono text-[10px] text-gray-500">
                    {point.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liquidity Info */}
        {asset.tvl && (
          <div className="mb-6 p-4 glass-input rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-gray-400">Total Liquidity</span>
              <span className="font-mono text-sm font-bold text-white">
                {formatUSD(asset.tvl)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">24h Volume</span>
              <span className="font-mono text-sm font-bold text-hydro">
                ${(asset.tvl * 0.15).toFixed(0)}
              </span>
            </div>
          </div>
        )}

        {/* Buy Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowPaymentModal(true)}
          className="w-full mb-4"
        >
          <i data-lucide="shopping-cart" className="w-5 h-5"></i>
          {asset.priceModel === "free" ? "Get Free Access" : "Buy Access"}
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="font-mono text-xs text-gray-400 mb-1">Total Sales</p>
            <p className="font-sans text-lg font-bold text-white">{asset.sales}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-gray-400 mb-1">Last Sale</p>
            <p className="font-sans text-lg font-bold text-success">
              {formatPrice(asset.price, "CAPY", 0)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <i data-lucide="shield-check" className="w-4 h-4 text-success"></i>
            Secured by blockchain
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <i data-lucide="lock" className="w-4 h-4 text-hydro"></i>
            Encrypted with Seal protocol
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <i data-lucide="database" className="w-4 h-4 text-grass"></i>
            Stored on Walrus network
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        asset={asset}
      />
    </>
  );
};

export default FinancialModule;
