"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeftRight, ChevronDown, Copy, Database, Download, ExternalLink, LogOut, User, Wallet } from "lucide-react";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useConnectWallet,
  useWallets,
  useSuiClientQuery,
  useAccounts,
  useSwitchAccount,
} from "@mysten/dapp-kit";
import { truncateAddress, copyToClipboard } from "@/lib/utils";
import { formatSUI } from "@/lib/sui";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Common/Modal";
import Button from "@/components/Common/Button";

export function WalletButton() {
  const account = useCurrentAccount();
  const accounts = useAccounts();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();
  const { mutate: switchAccount } = useSwitchAccount();
  const wallets = useWallets();
  const { addToast } = useToast();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
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

  const handleSwitchAccount = (address: string) => {
    switchAccount({ account: accounts.find(acc => acc.address === address)! }, {
      onSuccess: () => {
        setShowAccountSwitcher(false);
        setShowAccountMenu(false);
        addToast("Switched account successfully", "success");
      },
      onError: (error) => {
        addToast(`Failed to switch account: ${error.message}`, "error");
      }
    });
  };

  const suiBalance = balance ? formatSUI(BigInt(balance.totalBalance)) : "0.0000";

  // Wallet Selection Modal (for initial connection)
  const walletModal = (
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
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yuzu transition-colors" />
          </button>
        ))}

        {wallets.length === 0 && (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="font-mono text-sm text-gray-400">
              No wallets detected. Please install a Sui wallet extension.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );

  // Account Switcher Modal (for switching between accounts in the same wallet)
  const accountSwitcherModal = (
    <Modal
      isOpen={showAccountSwitcher}
      onClose={() => setShowAccountSwitcher(false)}
      title="Switch Account"
      size="sm"
    >
      <div className="space-y-3">
        <p className="font-mono text-sm text-gray-400 mb-4">
          Select which account to use from your wallet
        </p>

        {accounts.length > 1 ? (
          accounts.map((acc, index) => {
            const isCurrentAccount = acc.address === account?.address;
            return (
              <button
                key={acc.address}
                onClick={() => !isCurrentAccount && handleSwitchAccount(acc.address)}
                disabled={isCurrentAccount}
                className={`w-full glass-card p-4 rounded-lg transition-all group flex items-center gap-4 ${
                  isCurrentAccount
                    ? "border-yuzu/50 bg-yuzu/10 cursor-default"
                    : "hover:border-yuzu/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-yuzu-hydro flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-sans font-bold text-white group-hover:text-yuzu transition-colors flex items-center gap-2">
                    Account {index + 1}
                    {isCurrentAccount && (
                      <span className="text-[10px] font-mono bg-yuzu/20 text-yuzu px-2 py-0.5 rounded border border-yuzu/30">
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  <p className="font-mono text-xs text-gray-400">
                    {truncateAddress(acc.address, 8)}
                  </p>
                </div>
                {!isCurrentAccount && (
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yuzu transition-colors" />
                )}
              </button>
            );
          })
        ) : (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="font-mono text-sm text-gray-400 mb-2">
              Only one account found
            </p>
            <p className="font-mono text-xs text-gray-500">
              Add more accounts in your wallet extension to switch between them
            </p>
          </div>
        )}
      </div>
    </Modal>
  );

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
          <Wallet className="w-4 h-4" />
          CONNECT WALLET
        </Button>

        {walletModal}
      </>
    );
  }

  // If connected, show account menu
  return (
    <>
      {walletModal}
      {accountSwitcherModal}

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
          <ChevronDown  />
        </button>

        {/* Account Dropdown Menu */}
        {showAccountMenu && (
        <div className="absolute right-0 mt-2 w-80 glass-modal rounded-xl shadow-2xl overflow-hidden animate-scaleIn z-50">
          {/* Account Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-yuzu-hydro flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
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
                <Copy className="w-3 h-3 group-hover:text-yuzu" />
                Copy Address
              </button>
              <a
                href={`https://suiscan.xyz/testnet/account/${account.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group text-xs font-mono text-gray-300"
              >
                <ExternalLink className="w-3 h-3 group-hover:text-yuzu" />
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
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm text-white">SUI</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  {suiBalance}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setShowAccountMenu(false);
                setShowAccountSwitcher(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <ArrowLeftRight className="w-4 h-4 text-gray-400 group-hover:text-yuzu" />
              <div className="flex-1 text-left">
                <span className="font-mono text-sm text-gray-300 group-hover:text-white block">
                  Switch Account
                </span>
                {accounts.length > 1 && (
                  <span className="font-mono text-xs text-gray-500">
                    {accounts.length} accounts available
                  </span>
                )}
              </div>
            </button>

            <div className="border-t border-white/10 my-2"></div>

            <a
              href={`/profile?address=${account.address}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <User className="w-4 h-4 text-gray-400 group-hover:text-yuzu" />
              <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                My Profile
              </span>
            </a>

            <a
              href={`/profile?address=${account.address}#published`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <Database className="w-4 h-4 text-gray-400 group-hover:text-yuzu" />
              <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                My Assets
              </span>
            </a>

            <a
              href={`/profile?address=${account.address}#downloads`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
            >
              <Download className="w-4 h-4 text-gray-400 group-hover:text-yuzu" />
              <span className="font-mono text-sm text-gray-300 group-hover:text-white flex-1">
                My Downloads
              </span>
            </a>

            <div className="border-t border-white/10 my-2"></div>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error/10 transition-all group"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-error" />
              <span className="font-mono text-sm text-gray-300 group-hover:text-error flex-1 text-left">
                Disconnect
              </span>
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default WalletButton;
