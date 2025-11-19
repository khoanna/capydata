"use client";

import { useState, useRef, useEffect } from "react";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useConnectWallet,
  useWallets,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { truncateAddress, copyToClipboard } from "@/lib/utils";
import { formatSUI } from "@/lib/sui";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Common/Modal";
import Button from "@/components/Common/Button";
import Badge from "@/components/Common/Badge";

type Network = "mainnet" | "testnet" | "devnet" | "localnet";

export function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();
  const wallets = useWallets();
  const { addToast } = useToast();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("testnet");
  const menuRef = useRef<HTMLDivElement>(null);

  // Get SUI balance
  const { data: balance } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address || "",
    },
    {
      enabled: !!account,
    }
  );

  // Mock CAPY balance
  const mockCapyBalance = 1234.56;

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccountMenu]);

  const handleConnect = (walletName: string) => {
    connect(
      { wallet: wallets.find((w) => w.name === walletName)! },
      {
        onSuccess: () => {
          setShowWalletModal(false);
          addToast("Wallet connected successfully!", "success");
        },
        onError: (error) => {
          addToast(`Failed to connect: ${error.message}`, "error");
        },
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
    setShowAccountMenu(false);
    addToast("Wallet disconnected", "info");
  };

  const handleCopyAddress = async () => {
    if (account) {
      const success = await copyToClipboard(account.address);
      if (success) {
        addToast("Address copied to clipboard", "success");
      }
    }
  };

  const networks: { value: Network; label: string; color: string }[] = [
    { value: "mainnet", label: "Sui Mainnet", color: "text-success" },
    { value: "testnet", label: "Sui Testnet", color: "text-pending" },
    { value: "devnet", label: "Sui Devnet", color: "text-info" },
    { value: "localnet", label: "Sui Localnet", color: "text-gray-400" },
  ];

  const currentNetworkObj = networks.find((n) => n.value === selectedNetwork);
  const suiBalance = balance ? formatSUI(BigInt(balance.totalBalance)) : "0.0000";

  // If not connected, show connect button
  if (!account) {
    return (
      <>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowWalletModal(true)}
          className="flex items-center gap-2"
        >
          <i data-lucide="wallet" className="w-4 h-4"></i>
          CONNECT WALLET
        </Button>

        {/* Wallet Selection Modal */}
        <Modal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          title="Connect Wallet"
          size="sm"
        >
          <div className="space-y-3">
            <p className="font-mono text-sm text-gray-400 mb-4">
              Choose your preferred wallet to connect to CapyData
            </p>

            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                className="w-full glass-card p-4 rounded-lg hover:border-yuzu/50 transition-all group flex items-center gap-4"
              >
                {wallet.icon && (
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-10 h-10 rounded-lg"
                  />
                )}
                <div className="flex-1 text-left">
                  <h3 className="font-sans font-bold text-white group-hover:text-yuzu transition-colors">
                    {wallet.name}
                  </h3>
                  <p className="font-mono text-xs text-gray-400">
                    Click to connect
                  </p>
                </div>
                <i
                  data-lucide="arrow-right"
                  className="w-5 h-5 text-gray-400 group-hover:text-yuzu transition-colors"
                ></i>
              </button>
            ))}

            {wallets.length === 0 && (
              <div className="text-center py-8">
                <i
                  data-lucide="wallet"
                  className="w-12 h-12 text-gray-600 mx-auto mb-3"
                ></i>
                <p className="font-mono text-sm text-gray-400">
                  No wallets detected. Please install a Sui wallet extension.
                </p>
              </div>
            )}
          </div>
        </Modal>
      </>
    );
  }

  // If connected, show account menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowAccountMenu(!showAccountMenu)}
        className="flex items-center gap-3 px-4 py-2.5 glass-card rounded-lg hover:border-yuzu/50 transition-all group"
      >
        {/* Status Indicator */}
        {/* <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> */}

        {/* Address */}
        <span className="font-mono text-xs text-white group-hover:text-yuzu transition-colors">
          {truncateAddress(account.address)}
        </span>

        {/* Chevron */}
        <i
          data-lucide="chevron-down"
          className={`w-4 h-4 text-gray-400 transition-transform ${showAccountMenu ? "rotate-180" : ""}`}
        ></i>
      </button>

      {/* Account Dropdown Menu */}
      {showAccountMenu && (
        <div className="absolute right-0 mt-2 w-80 glass-modal rounded-xl shadow-2xl overflow-hidden animate-scaleIn z-50">
          {/* Account Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-yuzu-hydro flex items-center justify-center">
                <i data-lucide="user" className="w-6 h-6 text-black"></i>
              </div>
              <div className="flex-1">
                <p className="font-mono text-xs text-gray-400 mb-1">
                  Connected
                </p>
                <p className="font-sans font-bold text-white text-sm">
                  {truncateAddress(account.address, 6)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyAddress}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group text-xs font-mono text-gray-300"
              >
                <i
                  data-lucide="copy"
                  className="w-3 h-3 group-hover:text-yuzu"
                ></i>
                Copy Address
              </button>
              <a
                href={`https://suiscan.xyz/testnet/account/${account.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group text-xs font-mono text-gray-300"
              >
                <i
                  data-lucide="external-link"
                  className="w-3 h-3 group-hover:text-yuzu"
                ></i>
                Explorer
              </a>
            </div>
          </div>

          {/* Balance Section */}
          <div className="p-4 border-b border-white/10 bg-white/5">
            <p className="font-mono text-xs text-gray-400 mb-3 uppercase tracking-wide">
              Balances
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 glass-input rounded-lg">
                <div className="flex items-center gap-2">
                  <i data-lucide="wallet" className="w-4 h-4 text-cyan-400"></i>
                  <span className="font-mono text-sm text-white">SUI</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  {suiBalance}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 glass-input rounded-lg">
                <div className="flex items-center gap-2">
                  <i data-lucide="coins" className="w-4 h-4 text-yuzu"></i>
                  <span className="font-mono text-sm text-white">CAPY</span>
                </div>
                <span className="font-mono text-sm font-bold text-yuzu">
                  {mockCapyBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Network Switcher */}
          <div className="p-4 border-b border-white/10">
            <p className="font-mono text-xs text-gray-400 mb-3 uppercase tracking-wide">
              Network
            </p>
            <div className="space-y-1">
              {networks.map((network) => (
                <button
                  key={network.value}
                  onClick={() => setSelectedNetwork(network.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    selectedNetwork === network.value
                      ? "bg-yuzu/20 border border-yuzu/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${network.color}`}></span>
                  <span className="font-mono text-sm text-white flex-1 text-left">
                    {network.label}
                  </span>
                  {selectedNetwork === network.value && (
                    <i data-lucide="check" className="w-4 h-4 text-yuzu"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <a
              href={`/profile/${account.address}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <i
                data-lucide="user"
                className="w-4 h-4 text-gray-400 group-hover:text-yuzu"
              ></i>
              <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                My Profile
              </span>
            </a>

            <a
              href={`/profile/${account.address}#published`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <i
                data-lucide="database"
                className="w-4 h-4 text-gray-400 group-hover:text-yuzu"
              ></i>
              <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                My Assets
              </span>
            </a>

            <a
              href={`/profile/${account.address}#downloads`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <i
                data-lucide="download"
                className="w-4 h-4 text-gray-400 group-hover:text-yuzu"
              ></i>
              <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                My Downloads
              </span>
            </a>

            <div className="border-t border-white/10 my-2"></div>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error/10 transition-all group"
            >
              <i
                data-lucide="log-out"
                className="w-4 h-4 text-gray-400 group-hover:text-error"
              ></i>
              <span className="font-mono text-sm text-gray-300 group-hover:text-error flex-1 text-left">
                Disconnect
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletButton;
