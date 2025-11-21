"use client";

import React, { useState, useEffect } from "react";
import { Lock, HardDrive, Fingerprint } from "lucide-react";

interface TerminalLine {
  id: number;
  command: string;
  output?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  delay: number;
}

const WhyUs = () => {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const commands: TerminalLine[] = [
    { id: 1, command: "$ sui client call --package seal", output: "✓ Protocol initialized", status: 'success', delay: 0 },
    { id: 2, command: "$ walrus daemon --connect testnet", output: "⚡ Node connected: 0x4a7b..3f2e", status: 'info', delay: 800 },
    { id: 3, command: "$ seal encrypt --threshold 2/3 data.bin", output: "🔐 Encrypted 2.4 TB", status: 'success', delay: 1600 },
    { id: 4, command: "$ walrus store --blob encrypted.seal", output: "📡 Stored: blob_8x9a..4d2f", status: 'info', delay: 2400 },
    { id: 5, command: "$ sui tx verify-ownership --proof merkle", output: "✓ Ownership verified", status: 'success', delay: 3200 },
    { id: 6, command: "$ marketplace publish --metadata dataset.json", output: "🚀 Published to chain", status: 'success', delay: 4000 },
  ];

  useEffect(() => {
    if (currentLineIndex >= commands.length) {
      // Reset after all commands shown
      const resetTimer = setTimeout(() => {
        setTerminalLines([]);
        setCurrentLineIndex(0);
        setCurrentText("");
      }, 5000);
      return () => clearTimeout(resetTimer);
    }

    const currentCommand = commands[currentLineIndex];
    const commandDelay = currentCommand.delay;

    const timer = setTimeout(() => {
      setIsTyping(true);
      let charIndex = 0;
      const command = currentCommand.command;

      const typingInterval = setInterval(() => {
        if (charIndex <= command.length) {
          setCurrentText(command.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);

          // Add completed line to terminal
          setTerminalLines(prev => [...prev, currentCommand]);
          setCurrentText("");
          setCurrentLineIndex(prev => prev + 1);
        }
      }, 30); // Typing speed

      return () => clearInterval(typingInterval);
    }, commandDelay);

    return () => clearTimeout(timer);
  }, [currentLineIndex]);

  return (
    <section
      id="features"
      className="py-24 border-t border-white/5 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-linear-to-l from-hydro/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-hydro/30 rounded mb-6 bg-hydro/5 text-hydro font-mono text-[10px] font-bold tracking-wide">
              POWERED BY SEAL × WALRUS
            </div>
            <h2 className="text-4xl md:text-5xl font-sans font-bold mb-6 leading-tight">
              TRUE <span className="text-hydro">DATA SOVEREIGNTY</span>.
            </h2>
            <p className="font-mono text-gray-400 mb-8 leading-relaxed">
              We don't just store files; we seal them. Built on the cutting-edge{" "}
              <strong className="text-white">Walrus Protocol</strong> for
              storage and <strong className="text-white">Seal</strong> for
              encryption, ensuring your data remains mathematically yours.
            </p>

            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded bg-hydro/10 flex items-center justify-center text-hydro shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white group-hover:text-hydro transition-colors">
                    Seal Encryption
                  </h4>
                  <p className="font-mono text-xs text-gray-500 mt-1 leading-relaxed">
                    Advanced cryptographic enveloping. Data is encrypted before
                    it ever leaves your browser. Only the private key holder can
                    unseal the payload.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded bg-yuzu/10 flex items-center justify-center text-yuzu shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white group-hover:text-yuzu transition-colors">
                    Walrus Storage
                  </h4>
                  <p className="font-mono text-xs text-gray-500 mt-1 leading-relaxed">
                    Next-gen decentralized blob storage. Walrus ensures cheaper,
                    faster, and more reliable availability than legacy IPFS
                    pinning services.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded bg-grass/10 flex items-center justify-center text-grass shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white group-hover:text-grass transition-colors">
                    Sovereign Access
                  </h4>
                  <p className="font-mono text-xs text-gray-500 mt-1 leading-relaxed">
                    No platform lock-in. Your data lives on the Walrus network,
                    independent of the CapyData interface.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative h-[500px] bg-void border border-white/5 rounded-2xl p-8 reveal delay-100 overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hydro/10 blur-[60px] rounded-full animate-pulse"></div>

            {/* Terminal Header */}
            <div className="font-mono text-xs text-gray-500 mb-4 flex justify-between relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-hydro">ARCHITECTURE_VIEW</span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-600">capy@datanode</span>
              </div>
              <span className="text-green-500 animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                LIVE
              </span>
            </div>

            {/* Terminal Content */}
            <div className="relative z-10 h-[400px] overflow-hidden">
              <div className="space-y-2 font-mono text-sm">
                {/* Rendered completed lines */}
                {terminalLines.map((line) => (
                  <div key={line.id} className="animate-fadeInUp">
                    {/* Command line */}
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-grass">➜</span>
                      <span className="text-hydro/80">{line.command}</span>
                    </div>
                    {/* Output line */}
                    {line.output && (
                      <div className={`ml-4 mt-1 flex items-center gap-2 ${
                        line.status === 'success' ? 'text-green-400' :
                        line.status === 'info' ? 'text-blue-400' :
                        line.status === 'warning' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        <span className="opacity-60">└─</span>
                        <span>{line.output}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Currently typing line */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-400 animate-fadeInUp">
                    <span className="text-grass">➜</span>
                    <span className="text-hydro/80">{currentText}</span>
                    <span className="inline-block w-2 h-4 bg-hydro animate-pulse ml-1"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Footer - System Stats */}
            <div className="absolute bottom-8 left-8 right-8 border-t border-white/5 pt-4 z-10">
              <div className="flex justify-between items-center font-mono text-[10px] text-gray-600">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-hydro rounded-full animate-pulse"></span>
                    CPU: 23%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-yuzu rounded-full animate-pulse"></span>
                    MEM: 4.2GB
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-grass rounded-full animate-pulse"></span>
                    NET: 128 MB/s
                  </span>
                </div>
                <span className="text-gray-700">v2.1.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
