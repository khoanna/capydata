"use client";
import { Store, Upload, User, Database } from "lucide-react";

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
        <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
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
            <Store className="w-3 h-3" /> MARKETPLACE
          </Link>
          <Link
            href="/publish"
            className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
          >
            <Upload className="w-3 h-3" /> PUBLISH
          </Link>
          {account && (
            <Link
              href={`/profile/${account.address}`}
              className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
            >
              <User className="w-3 h-3" /> PROFILE
            </Link>
          )}
          {account && (
            <Link
              href={`https://capydata.gitbook.io/capydata-docs`}
              className="hover:text-yuzu hover:underline decoration-dashed underline-offset-8 transition-all flex items-center gap-2"
            >
              <Database className="w-3 h-3" /> DOCS
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet Connect Button */}
          <WalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
