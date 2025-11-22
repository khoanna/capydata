"use client";
import { Check, CheckCircle, Copy, ExternalLink, Eye } from "lucide-react";
import { PublishFormData } from "./PublishWizard";
import { useState } from "react";
import Button from "@/components/Common/Button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

interface DeployProgressProps {
  formData: PublishFormData;
  txResult: {digest: string; effects?: any} | null;
  onComplete?: () => void;
}

const DeployProgress = ({ formData, txResult, onComplete }: DeployProgressProps) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewMarketplace = () => {
    router.push("/marketplace");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Deployment Successful!
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Your dataset has been published to the blockchain.
        </p>
      </div>

      <div className="glass-card p-6 rounded-lg border border-success/30 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-white text-lg">
              Dataset Published Successfully!
            </h3>
            <p className="font-mono text-xs text-gray-400">
              Your dataset is now available on the marketplace
            </p>
          </div>
        </div>

        {txResult && (
          <div className="p-4 glass-input rounded-lg space-y-3">
            <div>
              <label className="font-mono text-xs text-gray-400 block mb-1">
                Transaction Digest
              </label>
              <div className="flex items-center gap-2">
                <a
                  href={`https://suiscan.xyz/testnet/tx/${txResult.digest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-hydro hover:underline flex items-center gap-1"
                >
                  {txResult.digest.slice(0, 20)}...{txResult.digest.slice(-20)}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => copyToClipboard(txResult.digest)}
                  className="p-1 hover:bg-white/5 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 glass-input rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">Title</span>
            <span className="font-mono text-sm text-white font-bold">
              {formData.title}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">Filename</span>
            <span className="font-mono text-sm text-white">
              {formData.filename}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">File Type</span>
            <span className="font-mono text-sm text-white">
              {formData.filetype}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">Price Model</span>
            <span className="font-mono text-sm text-white capitalize">
              {formData.pricingModel}
            </span>
          </div>
          {formData.pricingModel !== "free" && (
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">Price</span>
              <span className="font-mono text-sm text-yuzu font-bold">
                {formData.price} SUI
              </span>
            </div>
          )}
          {formData.tags.length > 0 && (
            <div>
              <label className="font-mono text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 glass-input rounded border border-hydro/30 font-mono text-xs text-hydro"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 glass-input rounded-lg">
          <p className="font-mono text-xs text-gray-400 mb-3 font-bold">
            What next?
          </p>
          <ul className="space-y-2">
            {[
              "Your dataset is now encrypted and stored on Walrus",
              "Metadata has been recorded on Sui blockchain",
              "Buyers can discover and purchase your dataset",
              "Track sales and earnings in your profile",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span className="font-mono text-xs text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleViewMarketplace}
            className="flex-1 font-mono"
          >
            <Eye className="w-5 h-5" />
            View Marketplace
          </Button>
          {txResult && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => copyToClipboard(txResult.digest)}
              className="flex-1 font-mono"
            >
              <Copy className="w-5 h-5" />
              {copied ? "Copied!" : "Copy TX"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployProgress;
