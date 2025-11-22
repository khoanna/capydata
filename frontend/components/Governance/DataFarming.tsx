"use client";
import { Check, Coins, Download, DownloadCloud, Gift, Info, Layers, Lock, MinusCircle, PlusCircle, TrendingUp } from "lucide-react";

import { useState } from "react";
import { formatPrice, suiToUSD, formatUSD } from "@/lib/utils";
import Button from "@/components/Common/Button";
import { Input } from "@/components/Common/Input";
import Badge from "@/components/Common/Badge";
import { useToast } from "@/hooks/useToast";

interface Pool {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  yourStake: number;
  pendingRewards: number;
  lockPeriod: string;
  multiplier: number;
}

const DataFarming = () => {
  const { addToast } = useToast();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  // Mock staking pools
  const pools: Pool[] = [
    {
      id: "flexible",
      name: "Flexible Staking",
      apy: 12.5,
      tvl: 850000,
      yourStake: 0,
      pendingRewards: 0,
      lockPeriod: "None",
      multiplier: 1,
    },
    {
      id: "30day",
      name: "30-Day Lock",
      apy: 18.3,
      tvl: 620000,
      yourStake: 2500,
      pendingRewards: 45.2,
      lockPeriod: "30 days",
      multiplier: 1.5,
    },
    {
      id: "90day",
      name: "90-Day Lock",
      apy: 24.5,
      tvl: 480000,
      yourStake: 5000,
      pendingRewards: 127.8,
      lockPeriod: "90 days",
      multiplier: 2,
    },
    {
      id: "180day",
      name: "180-Day Lock",
      apy: 32.7,
      tvl: 320000,
      yourStake: 0,
      pendingRewards: 0,
      lockPeriod: "180 days",
      multiplier: 2.5,
    },
  ];

  const totalStaked = pools.reduce((sum, pool) => sum + pool.yourStake, 0);
  const totalPending = pools.reduce((sum, pool) => sum + pool.pendingRewards, 0);

  const handleStake = (poolId: string) => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    addToast("Staking transaction submitted...", "pending");
    setTimeout(() => {
      addToast(`Successfully staked ${stakeAmount} SUI!`, "success");
      setStakeAmount("");
      setSelectedPool(null);
    }, 2000);
  };

  const handleClaim = (poolId: string) => {
    addToast("Claiming rewards...", "pending");
    setTimeout(() => {
      const pool = pools.find((p) => p.id === poolId);
      addToast(`Claimed ${pool?.pendingRewards} SUI rewards!`, "success");
    }, 2000);
  };

  const handleClaimAll = () => {
    addToast("Claiming all rewards...", "pending");
    setTimeout(() => {
      addToast(`Claimed ${totalPending.toFixed(2)} SUI rewards!`, "success");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* User Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-lg border border-grass/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Your Total Staked
          </p>
          <p className="font-sans text-3xl font-bold text-grass mb-1">
            {totalStaked.toLocaleString()}
            <span className="text-sm ml-1">CAPY</span>
          </p>
          <p className="font-mono text-xs text-gray-500">
            ≈ {formatUSD(suiToUSD(totalStaked))}
          </p>
        </div>

        <div className="glass-card p-5 rounded-lg border border-yuzu/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Gift className="w-3 h-3" />
            Pending Rewards
          </p>
          <p className="font-sans text-3xl font-bold text-yuzu mb-1">
            {totalPending.toFixed(2)}
            <span className="text-sm ml-1">CAPY</span>
          </p>
          <p className="font-mono text-xs text-gray-500">
            ≈ {formatUSD(suiToUSD(totalPending))}
          </p>
        </div>

        <div className="glass-card p-5 rounded-lg border border-hydro/30">
          <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Weighted APY
          </p>
          <p className="font-sans text-3xl font-bold text-hydro">
            {totalStaked > 0
              ? (
                  pools.reduce(
                    (sum, pool) => sum + (pool.yourStake / totalStaked) * pool.apy,
                    0
                  )
                ).toFixed(1)
              : "0"}%
          </p>
          <p className="font-mono text-xs text-gray-500">
            Average across pools
          </p>
        </div>
      </div>

      {/* Claim All Button */}
      {totalPending > 0 && (
        <div className="glass-card p-5 rounded-lg border border-yuzu/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-white mb-1">
                Harvest All Rewards
              </h3>
              <p className="font-mono text-sm text-gray-400">
                Claim {totalPending.toFixed(2)} SUI from all pools
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={handleClaimAll}>
              <DownloadCloud className="w-5 h-5" />
              Claim All
            </Button>
          </div>
        </div>
      )}

      {/* Staking Pools */}
      <div className="space-y-4">
        <h2 className="text-2xl font-sans font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-grass" />
          Staking Pools
        </h2>

        {pools.map((pool, index) => (
          <div
            key={pool.id}
            className="glass-card p-6 rounded-lg hover:border-grass/30 transition-all"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Pool Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-sans font-bold text-xl text-white mb-2 flex items-center gap-2">
                      {pool.name}
                      <Badge
                        variant={pool.multiplier >= 2 ? "success" : "type"}
                        size="sm"
                      >
                        {pool.multiplier}x
                      </Badge>
                    </h3>
                    <p className="font-mono text-xs text-gray-400">
                      Lock Period: {pool.lockPeriod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-3xl font-bold text-grass">
                      {pool.apy}%
                    </p>
                    <p className="font-mono text-xs text-gray-400">APY</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 glass-input rounded-lg">
                    <p className="font-mono text-xs text-gray-400 mb-1">TVL</p>
                    <p className="font-mono text-sm font-bold text-white">
                      {formatPrice(pool.tvl, "CAPY", 0)}
                    </p>
                  </div>
                  <div className="p-3 glass-input rounded-lg">
                    <p className="font-mono text-xs text-gray-400 mb-1">Your Stake</p>
                    <p className="font-mono text-sm font-bold text-grass">
                      {formatPrice(pool.yourStake, "CAPY", 0)}
                    </p>
                  </div>
                  <div className="p-3 glass-input rounded-lg">
                    <p className="font-mono text-xs text-gray-400 mb-1">Pending</p>
                    <p className="font-mono text-sm font-bold text-yuzu">
                      {pool.pendingRewards.toFixed(2)} SUI
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:w-80 space-y-3">
                {selectedPool === pool.id ? (
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      hint="Enter SUI amount"
                      icon={<Coins className="w-4 h-4" />}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleStake(pool.id)}
                        className="flex-1"
                      >
                        Stake
                      </Button>
                      <Button
                        variant="ghost"
                        size="md"
                        onClick={() => {
                          setSelectedPool(null);
                          setStakeAmount("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSelectedPool(pool.id)}
                    className="w-full"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Stake SUI
                  </Button>
                )}

                {pool.yourStake > 0 && (
                  <>
                    <Button variant="ghost" size="lg" className="w-full">
                      <MinusCircle className="w-5 h-5" />
                      Unstake
                    </Button>
                    {pool.pendingRewards > 0 && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => handleClaim(pool.id)}
                        className="w-full"
                      >
                        <Download className="w-5 h-5" />
                        Claim {pool.pendingRewards.toFixed(2)} SUI
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="glass-card p-6 rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-mono text-sm text-white mb-3 font-bold">
              How Data Farming Works
            </h3>
            <ul className="space-y-2">
              {[
                "Stake your SUI tokens in one or more pools to earn rewards",
                "Longer lock periods provide higher APY and reward multipliers",
                "Rewards are calculated and distributed every block",
                "Claim rewards anytime without unstaking your principal",
                "Early unstaking from locked pools may incur penalties",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                  <span className="font-mono text-xs text-gray-400 leading-relaxed">
                    {point}
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

export default DataFarming;
