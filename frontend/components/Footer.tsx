import Link from "next/link";
import Image from "next/image";
import React from "react";

interface FooterProps {
  transparent?: boolean;
}

const Footer = ({ transparent = false }: FooterProps) => {
  return (
    <footer className={`${transparent ? "bg-transparent border-t-transparent" : "bg-void border-t border-white/10"} pt-24 pb-12 relative`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.png"
                alt="CapyData Logo"
                priority
                width={60}
                height={60}
              />
              <span className="font-mono font-bold text-lg">CapyData</span>
            </div>
            <p className="font-mono text-gray-500 text-xs max-w-sm leading-relaxed">
              CapyData is the leading decentralized marketplace for raw,
              high-fidelity data streams. Verified on-chain, secured by
              capybaras.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-white">MARKETPLACE</h4>

            <ul className="space-y-2 font-mono text-xs text-gray-500">
              <li>
                <Link href="/marketplace" className="hover:text-yuzu transition-colors">
                  All Datasets
                </Link>
              </li>
              <li>
                <Link href="/publish" className="hover:text-yuzu transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yuzu transition-colors">
                  Data API
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-white">COMMUNITY</h4>
            <ul className="space-y-2 font-mono text-xs text-gray-500">
              <li>
                <a target="_blank" href="https://x.com/CapyDataMarket" className="hover:text-yuzu transition-colors">
                  Twitter / X
                </a>
              </li>
              <li>
              </li>
              <li>
                <a target="_blank" href="https://github.com/khoanna/decentralized-data-marketplace" className="hover:text-yuzu transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-white">Documentation</h4>
            <ul className="space-y-2 font-mono text-xs text-gray-500">
              <li>
                <a target="_blank" href="https://capydata.gitbook.io/capydata-docs" className="hover:text-yuzu transition-colors">
                  User docs
                </a>
              </li>
            </ul> 
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center font-mono text-[10px] text-gray-600">
          <div>© 2025 CapyData Inc.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            {/* <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
              SYSTEM: OPERATIONAL
            </span> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
