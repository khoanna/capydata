"use client";

import { useState } from "react";
import { Asset } from "@/lib/mockData";
import { formatPrice, capyToUSD, formatUSD, generateTxHash, sleep } from "@/lib/utils";
import Modal from "@/components/Common/Modal";
import Button from "@/components/Common/Button";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useToast } from "@/hooks/useToast";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

type Step = "approve" | "purchase" | "receipt";

const PaymentModal = ({ isOpen, onClose, asset }: PaymentModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("approve");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { addToast } = useToast();
  const account = useCurrentAccount();

  const handleApprove = async () => {
    if (!account) {
      addToast("Please connect your wallet first", "error");
      return;
    }

    setIsProcessing(true);
    addToast("Approval transaction submitted", "pending");

    // Simulate transaction
    await sleep(2000);
    const hash = generateTxHash();
    setTxHash(hash);

    addToast("Approval confirmed!", "success", hash);
    setIsProcessing(false);
    setCurrentStep("purchase");
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    addToast("Purchase transaction submitted", "pending");

    // Simulate transaction
    await sleep(3000);
    const hash = generateTxHash();
    setTxHash(hash);

    addToast("Purchase successful!", "success", hash);
    setIsProcessing(false);
    setCurrentStep("receipt");
  };

  const handleClose = () => {
    setCurrentStep("approve");
    setIsProcessing(false);
    setTxHash("");
    onClose();
  };

  const mockGasFee = 0.001; // Mock gas in SUI

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Purchase Data Access"
      size="md"
    >
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              currentStep === "approve"
                ? "border-yuzu bg-yuzu/20 text-yuzu"
                : "border-success bg-success/20 text-success"
            }`}
          >
            {currentStep !== "approve" ? (
              <i data-lucide="check" className="w-5 h-5"></i>
            ) : (
              <span className="font-mono text-sm font-bold">1</span>
            )}
          </div>
          <span className="font-mono text-xs text-gray-400 mt-2">Approve</span>
        </div>

        <div className="w-12 h-0.5 bg-white/10"></div>

        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              currentStep === "purchase"
                ? "border-yuzu bg-yuzu/20 text-yuzu"
                : currentStep === "receipt"
                  ? "border-success bg-success/20 text-success"
                  : "border-white/20 bg-white/5 text-gray-400"
            }`}
          >
            {currentStep === "receipt" ? (
              <i data-lucide="check" className="w-5 h-5"></i>
            ) : (
              <span className="font-mono text-sm font-bold">2</span>
            )}
          </div>
          <span className="font-mono text-xs text-gray-400 mt-2">Purchase</span>
        </div>

        <div className="w-12 h-0.5 bg-white/10"></div>

        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              currentStep === "receipt"
                ? "border-yuzu bg-yuzu/20 text-yuzu"
                : "border-white/20 bg-white/5 text-gray-400"
            }`}
          >
            <span className="font-mono text-sm font-bold">3</span>
          </div>
          <span className="font-mono text-xs text-gray-400 mt-2">Receipt</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === "approve" && (
        <div className="space-y-6">
          <div className="p-4 glass-input rounded-lg">
            <div className="flex items-start gap-3">
              <i data-lucide="info" className="w-5 h-5 text-info mt-0.5"></i>
              <div>
                <p className="font-mono text-sm text-white mb-2">
                  Approval Required
                </p>
                <p className="font-mono text-xs text-gray-400 leading-relaxed">
                  You must allow the marketplace contract to spend your CAPY tokens.
                  This is a one-time approval for this transaction.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 glass-card rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-gray-400">Token</span>
              <span className="font-mono text-sm text-white">CAPY</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-gray-400">Amount</span>
              <span className="font-mono text-sm text-white">
                {formatPrice(asset.price)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleApprove}
            isLoading={isProcessing}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Approving..." : "Approve CAPY"}
          </Button>
        </div>
      )}

      {currentStep === "purchase" && (
        <div className="space-y-6">
          <div className="p-6 glass-card rounded-lg space-y-4">
            <h4 className="font-sans font-bold text-white text-lg mb-4">
              Order Summary
            </h4>

            <div className="flex items-start justify-between">
              <span className="font-mono text-sm text-gray-400">Item</span>
              <span className="font-mono text-sm text-white text-right max-w-xs">
                {asset.title}
              </span>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm text-gray-400">Price</span>
                <span className="font-mono text-sm text-white">
                  {formatPrice(asset.price)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm text-gray-400">Gas Fee (est.)</span>
                <span className="font-mono text-sm text-white">
                  {mockGasFee} SUI
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-white">Total</span>
                <div className="text-right">
                  <p className="font-sans font-bold text-yuzu text-xl">
                    {formatPrice(asset.price)}
                  </p>
                  <p className="font-mono text-xs text-gray-400">
                    ≈ {formatUSD(capyToUSD(asset.price))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handlePurchase}
            isLoading={isProcessing}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      )}

      {currentStep === "receipt" && (
        <div className="space-y-6">
          {/* Success Animation */}
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mb-4 animate-scaleIn">
              <i data-lucide="check" className="w-10 h-10 text-success"></i>
            </div>
            <h3 className="font-sans font-bold text-2xl text-white mb-2">
              Access Granted!
            </h3>
            <p className="font-mono text-sm text-gray-400 text-center max-w-sm">
              You now have full access to this dataset. The datatoken has been added
              to your wallet.
            </p>
          </div>

          {/* Transaction Details */}
          <div className="p-4 glass-card rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-gray-400">Transaction Hash</span>
              <a
                href={`https://suiscan.xyz/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-yuzu hover:underline flex items-center gap-1"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                <i data-lucide="external-link" className="w-3 h-3"></i>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">Paid</span>
              <span className="font-mono text-xs text-white">
                {formatPrice(asset.price)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleClose}
              className="flex-1"
            >
              <i data-lucide="download" className="w-5 h-5"></i>
              Download Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="flex-1"
            >
              <i data-lucide="user" className="w-5 h-5"></i>
              View in Profile
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
