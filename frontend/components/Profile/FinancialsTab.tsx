"use client";

import { useState } from "react";
import { formatPrice, formatUSD, capyToUSD, timeAgo } from "@/lib/utils";
import Button from "@/components/Common/Button";
import { useToast } from "@/hooks/useToast";
import { ArrowRight, BarChart2, Check, Clock, Download, DownloadCloud, ExternalLink, Lightbulb, List, Lock, TrendingUp, Wallet, Gift, Unlock } from "lucide-react";


interface FinancialsTabProps {
  address: string;
}

interface Transaction {
  id: string;
  type: "sale" | "reward" | "stake" | "unstake";
  amount: number;
  date: Date;
  txHash: string;
  description: string;
}

const FinancialsTab = ({ address }: FinancialsTabProps) => {
  const { addToast } = useToast();
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year" | "all">("month");

  // Mock financial data
  const earnings = {
    available: 2450,
    pending: 780,
    staked: 5000,
    totalEarned: 15420,
  };

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "sale",
      amount: 50,
      date: new Date(Date.now() - 86400000),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      description: "Global Weather Patterns 2024 sold",
    },
    {
      id: "2",
      type: "reward",
      amount: 125,
      date: new Date(Date.now() - 86400000 * 2),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      description: "Data farming rewards claimed",
    },
    {
      id: "3",
      type: "sale",
      amount: 150,
      date: new Date(Date.now() - 86400000 * 3),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      description: "AI Training Dataset - Healthcare sold",
    },
    {
      id: "4",
      type: "stake",
      amount: 1000,
      date: new Date(Date.now() - 86400000 * 5),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      description: "Staked CAPY for governance",
    },
    {
      id: "5",
      type: "reward",
      amount: 85,
      date: new Date(Date.now() - 86400000 * 7),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      description: "Weekly rewards distributed",
    },
  ];

  // Mock revenue over time data
  const revenueData = [
    { label: "Jan", value: 1200 },
    { label: "Feb", value: 1800 },
    { label: "Mar", value: 2400 },
    { label: "Apr", value: 3100 },
    { label: "May", value: 2800 },
    { label: "Jun", value: 3600 },
  ];

  const handleClaim = () => {
    addToast("Claiming rewards...", "pending");
    setTimeout(() => {
      addToast(`Successfully claimed ${formatPrice(earnings.available)}!`, "success");
    }, 2000);
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "sale":
        return <TrendingUp className="w-5 h-5" />;
      case "reward":
        return <Gift className="w-5 h-5" />;
      case "stake":
        return <Lock className="w-5 h-5" />;
      case "unstake":
        return <Unlock className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "sale":
        return "text-success";
      case "reward":
        return "text-yuzu";
      case "stake":
        return "text-hydro";
      case "unstake":
        return "text-grass";
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-lg border border-success/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Wallet className="w-3 h-3" />
            Available to Claim
          </p>
          <p className="font-sans text-3xl font-bold text-success mb-1">
            {earnings.available.toLocaleString()}
            <span className="text-sm ml-1">CAPY</span>
          </p>
          <p className="font-mono text-xs text-gray-500">
            ≈ {formatUSD(capyToUSD(earnings.available))}
          </p>
        </div>

        <div className="glass-card p-5 rounded-lg border border-pending/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Pending
          </p>
          <p className="font-sans text-3xl font-bold text-pending mb-1">
            {earnings.pending.toLocaleString()}
            <span className="text-sm ml-1">CAPY</span>
          </p>
          <p className="font-mono text-xs text-gray-500">
            ≈ {formatUSD(capyToUSD(earnings.pending))}
          </p>
        </div>

        <div className="glass-card p-5 rounded-lg border border-hydro/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Staked
          </p>
          <p className="font-sans text-3xl font-bold text-hydro mb-1">
            {earnings.staked.toLocaleString()}
            <span className="text-sm ml-1">CAPY</span>
          </p>
          <p className="font-mono text-xs text-gray-500">
            ≈ {formatUSD(capyToUSD(earnings.staked))}
          </p>
        </div>

        <div className="glass-card p-5 rounded-lg border border-yuzu/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Total Earned
          </p>
          <p className="font-sans text-3xl font-bold text-yuzu mb-1">
            {earnings.totalEarned.toLocaleString()}
            <span className="text-sm ml-1">CAPY</span>
          </p>
          <p className="font-mono text-xs text-gray-500">
            ≈ {formatUSD(capyToUSD(earnings.totalEarned))}
          </p>
        </div>
      </div>

      {/* Claim Rewards */}
      <div className="glass-card p-6 rounded-lg border border-success/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-white mb-2 flex items-center gap-2">
              <DownloadCloud className="w-5 h-5 text-success" />
              Claim Your Rewards
            </h3>
            <p className="font-mono text-sm text-gray-400">
              You have {formatPrice(earnings.available)} ready to claim
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleClaim}
            disabled={earnings.available === 0}
          >
            <Download className="w-5 h-5" />
            Claim {formatPrice(earnings.available, "CAPY", 0)}
          </Button>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-yuzu" />
            Revenue Over Time
          </h3>
          <div className="flex items-center gap-2">
            {(["week", "month", "year", "all"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all capitalize ${
                  timeframe === period
                    ? "bg-yuzu text-black"
                    : "glass-input text-gray-400 hover:text-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between h-48 gap-2">
          {revenueData.map((point, i) => {
            const maxValue = Math.max(...revenueData.map((d) => d.value));
            const height = (point.value / maxValue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full group">
                  <div
                    className="w-full bg-linear-to-t from-yuzu to-hydro rounded-t opacity-70 hover:opacity-100 transition-all cursor-pointer"
                    style={{ height: `${height * 1.5}px` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="glass-modal px-2 py-1 rounded font-mono text-xs text-white whitespace-nowrap">
                      {point.value} CAPY
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-gray-500">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="font-sans font-bold text-white mb-4 flex items-center gap-2">
          <List className="w-5 h-5 text-yuzu" />
          Recent Transactions
        </h3>

        <div className="space-y-3">
          {mockTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 glass-input rounded-lg hover:border-yuzu/30 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${getTransactionColor(tx.type)}`}
                  >
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-white mb-1 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">
                        {timeAgo(tx.date)}
                      </span>
                      <span className="text-gray-600">•</span>
                      <a
                        href={`https://suiscan.xyz/testnet/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-hydro hover:underline"
                      >
                        {tx.txHash.slice(0, 8)}...
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-mono text-sm font-bold ${getTransactionColor(tx.type)}`}>
                    {tx.type === "stake" ? "-" : "+"}{formatPrice(tx.amount, "CAPY", 0)}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {formatUSD(capyToUSD(tx.amount))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="font-mono text-xs text-hydro hover:underline">
            View all transactions
            <ArrowRight className="w-3 h-3 inline ml-1" />
          </button>
        </div>
      </div>

      {/* Earning Tips */}
      <div className="glass-card p-6 rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-sm text-white mb-3 font-bold">
              Maximize Your Earnings
            </p>
            <ul className="space-y-2">
              {[
                "Stake CAPY tokens to earn passive rewards and governance rights",
                "Participate in data farming by providing high-quality datasets",
                "Set competitive prices using dynamic pricing models",
                "Engage with the community to build reputation and visibility",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-success mt-0.5 shrink-0" />
                  <span className="font-mono text-xs text-gray-400 leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialsTab;
