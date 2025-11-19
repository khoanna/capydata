"use client";

import { formatDate } from "@/lib/utils";
import { useState } from "react";

interface ProvenanceEvent {
  type: "mint" | "update" | "sale" | "transfer";
  timestamp: string;
  txHash: string;
  description: string;
}

interface ProvenanceGraphProps {
  did: string;
}

const ProvenanceGraph = ({ did }: ProvenanceGraphProps) => {
  const [selectedEvent, setSelectedEvent] = useState<ProvenanceEvent | null>(null);

  // Mock provenance data
  const events: ProvenanceEvent[] = [
    {
      type: "mint",
      timestamp: "2024-01-10T10:30:00Z",
      txHash: "0xabcd1234...",
      description: "Data NFT minted on Polygon",
    },
    {
      type: "update",
      timestamp: "2024-03-15T14:20:00Z",
      txHash: "0xef567890...",
      description: "Metadata updated - Added tags",
    },
    {
      type: "sale",
      timestamp: "2024-05-20T09:15:00Z",
      txHash: "0x12345678...",
      description: "First sale - 50 CAPY",
    },
    {
      type: "sale",
      timestamp: "2024-11-15T16:45:00Z",
      txHash: "0x98765432...",
      description: "Latest sale - 50 CAPY",
    },
  ];

  const eventIcons: Record<string, { icon: string; color: string }> = {
    mint: { icon: "sparkles", color: "text-yuzu" },
    update: { icon: "edit", color: "text-info" },
    sale: { icon: "shopping-cart", color: "text-success" },
    transfer: { icon: "send", color: "text-hydro" },
  };

  return (
    <div className="glass-card p-8 reveal delay-200">
      <h2 className="text-2xl font-sans font-bold text-white mb-6 flex items-center gap-2">
        <i data-lucide="git-branch" className="w-6 h-6 text-yuzu"></i>
        Provenance Timeline
      </h2>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yuzu via-hydro to-grass"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="relative pl-16 group cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Icon */}
              <div
                className={`absolute left-0 w-12 h-12 rounded-full glass-card flex items-center justify-center border-2 border-white/10 group-hover:border-yuzu/50 transition-all ${
                  selectedEvent === event ? "border-yuzu scale-110" : ""
                }`}
              >
                <i
                  data-lucide={eventIcons[event.type].icon}
                  className={`w-5 h-5 ${eventIcons[event.type].color}`}
                ></i>
              </div>

              {/* Content */}
              <div
                className={`glass-input p-4 rounded-lg group-hover:border-yuzu/50 transition-all ${
                  selectedEvent === event ? "border-yuzu/50 bg-yuzu/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-sans font-bold text-white text-sm">
                    {event.description}
                  </h3>
                  <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(event.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <i data-lucide="hash" className="w-3 h-3"></i>
                    {event.txHash}
                  </span>
                  <a
                    href={`https://polygonscan.com/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-yuzu transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Explorer
                    <i data-lucide="external-link" className="w-3 h-3"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
        <div className="text-center">
          <p className="font-mono text-xs text-gray-400 mb-1">Total Events</p>
          <p className="font-sans text-2xl font-bold text-white">{events.length}</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xs text-gray-400 mb-1">Unique Owners</p>
          <p className="font-sans text-2xl font-bold text-hydro">3</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xs text-gray-400 mb-1">Total Volume</p>
          <p className="font-sans text-2xl font-bold text-success">150 CAPY</p>
        </div>
      </div>
    </div>
  );
};

export default ProvenanceGraph;
