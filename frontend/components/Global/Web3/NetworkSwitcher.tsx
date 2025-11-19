"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import Badge from "@/components/Common/Badge";

type Network = "mainnet" | "testnet" | "devnet" | "localnet";

export function NetworkSwitcher() {
  const { currentWallet } = useCurrentWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("testnet");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentWallet) return null;

  const networks: { value: Network; label: string; color: string }[] = [
    { value: "mainnet", label: "Sui Mainnet", color: "text-success" },
    { value: "testnet", label: "Sui Testnet", color: "text-pending" },
    { value: "devnet", label: "Sui Devnet", color: "text-info" },
    { value: "localnet", label: "Sui Localnet", color: "text-gray-400" },
  ];

  const currentNetworkObj = networks.find((n) => n.value === selectedNetwork);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 glass-input rounded-lg hover:border-yuzu/50 transition-all"
      >
        <span className={`w-2 h-2 rounded-full ${currentNetworkObj?.color}`}></span>
        <span className="font-mono text-xs text-white hidden md:inline">
          {currentNetworkObj?.label}
        </span>
        <i
          data-lucide="chevron-down"
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        ></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-modal rounded-lg shadow-xl z-50 overflow-hidden animate-scaleIn">
          {networks.map((network) => (
            <button
              key={network.value}
              onClick={() => {
                setSelectedNetwork(network.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                selectedNetwork === network.value
                  ? "bg-yuzu/20 border-l-2 border-yuzu"
                  : "hover:bg-white/5"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${network.color}`}></span>
              <span className="font-mono text-sm text-white flex-1">
                {network.label}
              </span>
              {selectedNetwork === network.value && (
                <i data-lucide="check" className="w-4 h-4 text-yuzu"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default NetworkSwitcher;
