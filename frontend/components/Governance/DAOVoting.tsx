"use client";
import { Check, ChevronDown, ChevronUp, Clock, Inbox, Info, PlusCircle, Shield, ThumbsDown, ThumbsUp, Settings, Wallet, Zap, Box, CheckCircle, XCircle } from "lucide-react";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import Button from "@/components/Common/Button";
import Badge from "@/components/Common/Badge";
import { useToast } from "@/hooks/useToast";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: "active" | "passed" | "rejected" | "pending";
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  startDate: Date;
  endDate: Date;
  category: "protocol" | "treasury" | "feature" | "other";
  userVote?: "for" | "against" | null;
}

const DAOVoting = () => {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<"all" | "active" | "passed" | "rejected">("active");
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  // Mock governance data
  const votingPower = 7500; // User's staked CAPY

  const proposals: Proposal[] = [
    {
      id: "1",
      title: "Reduce Platform Fee from 3% to 2.5%",
      description:
        "Proposal to reduce the marketplace platform fee from 3% to 2.5% to incentivize more data providers and increase competitiveness. This will reduce protocol revenue but may increase overall volume.",
      proposer: "0x742d35Cc6634C0532925a3b8...89C4",
      status: "active",
      votesFor: 124500,
      votesAgainst: 45200,
      quorum: 100000,
      startDate: new Date(Date.now() - 86400000 * 2),
      endDate: new Date(Date.now() + 86400000 * 5),
      category: "protocol",
      userVote: null,
    },
    {
      id: "2",
      title: "Allocate 50,000 CAPY for AI Dataset Bounty Program",
      description:
        "Create a bounty program with 50,000 CAPY from the treasury to incentivize high-quality AI training datasets. Datasets meeting quality criteria will receive rewards.",
      proposer: "0x8Ba1f109551bD432803012C1...3f8A",
      status: "active",
      votesFor: 98700,
      votesAgainst: 23100,
      quorum: 100000,
      startDate: new Date(Date.now() - 86400000 * 1),
      endDate: new Date(Date.now() + 86400000 * 6),
      category: "treasury",
      userVote: "for",
    },
    {
      id: "3",
      title: "Implement Compute-to-Data Privacy Proofs",
      description:
        "Add zero-knowledge proofs to Compute-to-Data operations to provide cryptographic verification that computations were performed correctly without revealing data.",
      proposer: "0x95cED938F7991cd0dFcb48F...2fC3",
      status: "active",
      votesFor: 156200,
      votesAgainst: 12300,
      quorum: 100000,
      startDate: new Date(Date.now() - 86400000 * 3),
      endDate: new Date(Date.now() + 86400000 * 4),
      category: "feature",
      userVote: null,
    },
    {
      id: "4",
      title: "Increase Data Farming APY by 5%",
      description:
        "Proposal to increase staking rewards across all pools by 5% to attract more liquidity and reward long-term holders.",
      proposer: "0x1f9840a85d5aF5bf1D1762F...DcA9",
      status: "passed",
      votesFor: 234500,
      votesAgainst: 45200,
      quorum: 100000,
      startDate: new Date(Date.now() - 86400000 * 10),
      endDate: new Date(Date.now() - 86400000 * 3),
      category: "protocol",
      userVote: "for",
    },
    {
      id: "5",
      title: "Remove Dataset Size Limit",
      description:
        "Remove the current 5GB dataset size limit to allow larger datasets on the marketplace.",
      proposer: "0x6B175474E89094C44Da98b9...D0C3",
      status: "rejected",
      votesFor: 45200,
      votesAgainst: 189300,
      quorum: 100000,
      startDate: new Date(Date.now() - 86400000 * 15),
      endDate: new Date(Date.now() - 86400000 * 8),
      category: "protocol",
      userVote: "against",
    },
  ];

  const filteredProposals = proposals.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const handleVote = (proposalId: string, vote: "for" | "against") => {
    addToast(`Voting ${vote} on proposal...`, "pending");
    setTimeout(() => {
      addToast(`Successfully voted ${vote}!`, "success");
    }, 2000);
  };

  const getStatusColor = (status: Proposal["status"]) => {
    switch (status) {
      case "active":
        return "info";
      case "passed":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "pending";
    }
  };

  const getCategoryIcon = (category: Proposal["category"]) => {
    switch (category) {
      case "protocol":
        return <Settings className="w-3 h-3" />;
      case "treasury":
        return <Wallet className="w-3 h-3" />;
      case "feature":
        return <Zap className="w-3 h-3" />;
      case "other":
        return <Box className="w-3 h-3" />;
    }
  };

  const calculateProgress = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst;
    if (total === 0) return 50;
    return (votesFor / total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Voting Power */}
      <div className="glass-card p-6 rounded-lg border border-grass/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-grass" />
              Your Voting Power
            </h3>
            <p className="font-mono text-sm text-gray-400">
              Based on your staked CAPY tokens
            </p>
          </div>
          <div className="text-right">
            <p className="font-sans text-4xl font-bold text-grass">
              {votingPower.toLocaleString()}
            </p>
            <p className="font-mono text-xs text-gray-400">votes</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { value: "all" as const, label: "All", count: proposals.length },
          {
            value: "active" as const,
            label: "Active",
            count: proposals.filter((p) => p.status === "active").length,
          },
          {
            value: "passed" as const,
            label: "Passed",
            count: proposals.filter((p) => p.status === "passed").length,
          },
          {
            value: "rejected" as const,
            label: "Rejected",
            count: proposals.filter((p) => p.status === "rejected").length,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all ${
              filter === tab.value
                ? "bg-yuzu text-black"
                : "glass-input text-gray-400 hover:text-white"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {filteredProposals.length > 0 ? (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const isExpanded = selectedProposal === proposal.id;
            const progress = calculateProgress(proposal.votesFor, proposal.votesAgainst);
            const quorumReached = proposal.votesFor + proposal.votesAgainst >= proposal.quorum;

            return (
              <div
                key={proposal.id}
                className="glass-card rounded-lg overflow-hidden hover:border-yuzu/30 transition-all"
              >
                {/* Proposal Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() =>
                    setSelectedProposal(isExpanded ? null : proposal.id)
                  }
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getStatusColor(proposal.status)} size="sm">
                          {proposal.status}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          {getCategoryIcon(proposal.category)}
                          <span className="font-mono text-xs capitalize">
                            {proposal.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-sans font-bold text-lg text-white mb-2">
                        {proposal.title}
                      </h3>
                      <p className="font-mono text-xs text-gray-400 mb-2">
                        Proposed by {proposal.proposer.slice(0, 10)}...
                        {proposal.proposer.slice(-6)} •{" "}
                        {timeAgo(proposal.startDate)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Voting Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-success">
                          For: {proposal.votesFor.toLocaleString()}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="font-mono text-error">
                          Against: {proposal.votesAgainst.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-mono text-gray-500">
                        Quorum: {quorumReached ? "✓" : "✗"}{" "}
                        {proposal.quorum.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-linear-to-r from-success to-success/80 transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                      <div
                        className="absolute inset-y-0 right-0 bg-linear-to-l from-error to-error/80 transition-all"
                        style={{ width: `${100 - progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Time Remaining */}
                  {proposal.status === "active" && (
                    <p className="font-mono text-xs text-gray-500 mt-3">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Ends {timeAgo(proposal.endDate)}
                    </p>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-6 space-y-4">
                    <div>
                      <p className="font-mono text-xs text-gray-400 mb-2">
                        Description
                      </p>
                      <p className="font-mono text-sm text-white leading-relaxed">
                        {proposal.description}
                      </p>
                    </div>

                    {/* Vote Buttons */}
                    {proposal.status === "active" && !proposal.userVote && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => handleVote(proposal.id, "for")}
                          className="flex-1"
                        >
                          <ThumbsUp className="w-5 h-5" />
                          Vote For
                        </Button>
                        <Button
                          variant="danger"
                          size="lg"
                          onClick={() => handleVote(proposal.id, "against")}
                          className="flex-1"
                        >
                          <ThumbsDown className="w-5 h-5" />
                          Vote Against
                        </Button>
                      </div>
                    )}

                    {/* Already Voted */}
                    {proposal.userVote && (
                      <div
                        className={`p-4 rounded-lg border ${
                          proposal.userVote === "for"
                            ? "border-success/30 bg-success/10"
                            : "border-error/30 bg-error/10"
                        }`}
                      >
                        <p className="font-mono text-sm text-white flex items-center gap-2">
                          {proposal.userVote === "for" ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-error" />
                          )}
                          You voted{" "}
                          <span
                            className={`font-bold ${
                              proposal.userVote === "for"
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {proposal.userVote}
                          </span>{" "}
                          on this proposal
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-lg text-center">
          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">
            No {filter !== "all" ? filter : ""} Proposals
          </h3>
          <p className="font-mono text-sm text-gray-400">
            {filter === "all"
              ? "There are currently no proposals."
              : `There are no ${filter} proposals at the moment.`}
          </p>
        </div>
      )}

      {/* Create Proposal CTA */}
      <div className="glass-card p-6 rounded-lg border border-yuzu/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-white mb-2">
              Have an Idea?
            </h3>
            <p className="font-mono text-sm text-gray-400">
              Submit a proposal to shape the future of CapyData
            </p>
          </div>
          <Button variant="primary" size="lg">
            <PlusCircle className="w-5 h-5" />
            Create Proposal
          </Button>
        </div>
      </div>

      {/* Governance Info */}
      <div className="glass-card p-6 rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <div>
            <h3 className="font-mono text-sm text-white mb-3 font-bold">
              About DAO Governance
            </h3>
            <ul className="space-y-2">
              {[
                "Voting power is based on your staked CAPY tokens",
                "Proposals need to reach quorum to be valid",
                "Active proposals have a 7-day voting period",
                "You can change your vote anytime before the voting period ends",
                "Passed proposals are implemented by the core team within 30 days",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-success mt-0.5 shrink-0" />
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

export default DAOVoting;
