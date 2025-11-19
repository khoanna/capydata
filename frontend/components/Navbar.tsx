"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import WalletButton from "./Global/Web3/WalletButton";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const account = useCurrentAccount();

  return (
    <nav className="fixed w-full z-40 top-0 border-b border-white/5 glass-panel">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
          <Image
            src="/logo.png"
            alt="CapyData Logo"
            priority
            width={60}
            height={60}
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-mono text-xl font-bold tracking-wider text-white group-hover:text-yuzu transition-colors">
              CapyData
            </span>
            <span className="font-mono text-[10px] text-gray-500 tracking-widest">
              THE CHILL MARKET
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-xs tracking-widest text-gray-400">
          <Link
            href="/marketplace"
            className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
          >
            <i data-lucide="store" className="w-3 h-3"></i> MARKETPLACE
          </Link>
          <Link
            href="/publish"
            className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
          >
            <i data-lucide="upload" className="w-3 h-3"></i> PUBLISH
          </Link>
          {account && (
            <Link
              href={`/profile/${account.address}`}
              className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
            >
              <i data-lucide="user" className="w-3 h-3"></i> PROFILE
            </Link>
          )}
          <Link
            href="/governance"
            className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
          >
            <i data-lucide="vote" className="w-3 h-3"></i> GOVERNANCE
          </Link>
        </div>

        {/* Right Side: Search + Web3 Components */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div className="relative hidden md:block">
            {!showSearch ? (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 glass-input rounded-lg hover:border-yuzu/50 transition-all"
                aria-label="Open search"
              >
                <i data-lucide="search" className="w-4 h-4 text-gray-400"></i>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-scaleIn">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search datasets..."
                  className="w-48 lg:w-64 glass-input px-3 py-2 rounded-lg font-mono text-xs text-white placeholder:text-gray-600"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setShowSearch(false);
                  }}
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="p-2 glass-input rounded-lg hover:border-error/50 transition-all"
                  aria-label="Close search"
                >
                  <i data-lucide="x" className="w-4 h-4 text-gray-400"></i>
                </button>
              </div>
            )}
          </div>

          {/* Wallet Connect Button */}
          <WalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
