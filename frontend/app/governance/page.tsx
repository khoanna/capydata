"use client";

import { useState } from "react";
import { Droplet, Users, TrendingUp, Vote, Sprout } from "lucide-react";
import DataFarming from "@/components/Governance/DataFarming";
import DAOVoting from "@/components/Governance/DAOVoting";

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<"farming" | "voting">("farming");

  const tabs = [
    { id: "farming" as const, label: "Data Farming", icon: <Sprout className="w-4 h-4" /> },
    { id: "voting" as const, label: "DAO Voting", icon: <Vote className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen pt-28 pb-20 bg-void">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-12 reveal">
          <h1 className="text-5xl font-sans font-bold text-white mb-4">
            Governance
          </h1>
          <p className="font-mono text-sm text-gray-400 max-w-2xl">
            Participate in CapyData governance through data farming rewards and DAO voting.
            Stake your SUI tokens to earn rewards and shape the future of the protocol.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 reveal delay-100">
          <div className="glass-card p-5 rounded-lg border border-grass/30">
            <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
              <Droplet className="w-3 h-3" />
              Total Value Locked
            </p>
            <p className="font-sans text-2xl font-bold text-grass">
              $2.4M
            </p>
          </div>

          <div className="glass-card p-5 rounded-lg border border-yuzu/30">
            <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
              <Users className="w-3 h-3" />
              Active Stakers
            </p>
            <p className="font-sans text-2xl font-bold text-yuzu">
              1,247
            </p>
          </div>

          <div className="glass-card p-5 rounded-lg border border-hydro/30">
            <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              APY
            </p>
            <p className="font-sans text-2xl font-bold text-hydro">
              24.5%
            </p>
          </div>

          <div className="glass-card p-5 rounded-lg border border-success/30">
            <p className="font-mono text-xs text-gray-400 mb-2 flex items-center gap-2">
              <Vote className="w-3 h-3" />
              Active Proposals
            </p>
            <p className="font-sans text-2xl font-bold text-success">
              3
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 reveal delay-200">
          <div className="flex items-center gap-2 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-mono text-sm transition-all relative ${
                  activeTab === tab.id
                    ? "text-yuzu"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yuzu"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="reveal delay-300">
          {activeTab === "farming" && <DataFarming />}
          {activeTab === "voting" && <DAOVoting />}
        </div>
      </div>
    </main>
  );
}
