"use client";
import { ArrowRight, Check, CheckCircle, Coins, Copy, Database, DollarSign, ExternalLink, Eye, FileText, Globe, Image as ImageIcon, Link, Loader, Settings, Upload, X } from "lucide-react";

import { PublishFormData } from "./PublishWizard";
import { useState, useEffect } from "react";
import { generateTxHash, sleep } from "@/lib/utils";
import Button from "@/components/Common/Button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

interface DeployProgressProps {
  formData: PublishFormData;
  onComplete?: () => void;
}

type DeployStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "processing" | "complete" | "error";
  txHash?: string;
};

const DeployProgress = ({ formData, onComplete }: DeployProgressProps) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [generatedDID, setGeneratedDID] = useState("");

  const [steps, setSteps] = useState<DeployStep[]>([
    {
      id: 1,
      title: "Mint NFT",
      description: "Creating unique NFT for your dataset",
      icon: <ImageIcon className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: 2,
      title: "Deploy Datatoken",
      description: "Deploying ERC20 access tokens",
      icon: <Coins className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: 3,
      title: "Publish Metadata",
      description: "Storing encrypted metadata on-chain",
      icon: <Database className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: 4,
      title: "Set Pricing",
      description: "Configuring pricing and access rules",
      icon: <DollarSign className="w-6 h-6" />,
      status: "pending",
    },
  ]);

  useEffect(() => {
    // Auto-start deployment
    executeDeployment();
  }, []);

  const executeDeployment = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);

      // Set step to processing
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === i ? { ...step, status: "processing" } : step
        )
      );

      // Simulate transaction
      await sleep(2000 + Math.random() * 1000);

      // Generate transaction hash
      const txHash = generateTxHash();

      // Set step to complete
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === i ? { ...step, status: "complete", txHash } : step
        )
      );

      // Show toast for each step
      addToast(`${steps[i].title} completed`, "success", txHash);
    }

    // Generate mock DID
    const did = `did:op:${generateTxHash().slice(0, 42)}`;
    setGeneratedDID(did);
    setDeploymentComplete(true);
    addToast("Dataset published successfully!", "success");
    
    // Call onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  const handleViewDataset = () => {
    // In real implementation, would navigate to the actual DID
    router.push("/marketplace");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          {deploymentComplete ? "Deployment Complete!" : "Deploying to Blockchain"}
        </h2>
        <p className="font-mono text-sm text-gray-400">
          {deploymentComplete
            ? "Your dataset is now live on the marketplace"
            : "Please wait while we deploy your dataset to the Sui blockchain"}
        </p>
      </div>

      {/* Deployment Steps */}
      <div className="glass-card p-8 rounded-lg space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-6 top-14 w-0.5 h-12 transition-all duration-500 ${
                  step.status === "complete"
                    ? "bg-linear-to-b from-success to-success/50"
                    : "bg-white/10"
                }`}
              ></div>
            )}

            <div className="flex items-start gap-4">
              {/* Step Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
                  step.status === "complete"
                    ? "border-success bg-success/20 scale-110"
                    : step.status === "processing"
                      ? "border-yuzu bg-yuzu/20 animate-pulse scale-110"
                      : step.status === "error"
                        ? "border-error bg-error/20"
                        : "border-white/20 bg-white/5"
                }`}
              >
                {step.status === "complete" ? (
                  <Check className="w-6 h-6 text-success" />
                ) : step.status === "processing" ? (
                  <div className="w-5 h-5 border-2 border-yuzu border-t-transparent rounded-full animate-spin"></div>
                ) : step.status === "error" ? (
                  <X className="w-6 h-6 text-error" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3
                      className={`font-mono text-sm font-bold transition-colors ${
                        step.status === "complete"
                          ? "text-success"
                          : step.status === "processing"
                            ? "text-yuzu"
                            : step.status === "error"
                              ? "text-error"
                              : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="font-mono text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {step.status === "processing" && (
                    <span className="px-2 py-1 bg-yuzu/20 border border-yuzu/30 rounded text-yuzu font-mono text-xs shrink-0">
                      Processing...
                    </span>
                  )}
                  {step.status === "complete" && (
                    <span className="px-2 py-1 bg-success/20 border border-success/30 rounded text-success font-mono text-xs shrink-0">
                      Complete
                    </span>
                  )}
                </div>

                {/* Transaction Hash */}
                {step.txHash && (
                  <a
                    href={`https://suiscan.xyz/testnet/tx/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-hydro hover:underline flex items-center gap-1 mt-2"
                  >
                    {step.txHash.slice(0, 12)}...{step.txHash.slice(-10)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Summary */}
      {deploymentComplete && (
        <div className="glass-card p-6 rounded-lg border border-success/30 space-y-4 animate-scaleIn">
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

          {/* Dataset Summary */}
          <div className="p-4 glass-input rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">Title</span>
              <span className="font-mono text-sm text-white font-bold">
                {formData.title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">DID</span>
              <span className="font-mono text-xs text-hydro">
                {generatedDID}
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
                  {formData.price} CAPY
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">Access Type</span>
              <span className="font-mono text-sm text-white capitalize">
                {formData.accessType === "compute" ? "Compute-to-Data" : "Download"}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 glass-input rounded-lg">
            <p className="font-mono text-xs text-gray-400 mb-3">
              What's next?
            </p>
            <ul className="space-y-2">
              {[
                "Share your dataset with potential buyers",
                "Monitor sales and analytics in your profile",
                "Update pricing or metadata anytime",
                "Earn rewards through data farming",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-yuzu" />
                  <span className="font-mono text-xs text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleViewDataset}
              className="flex-1"
            >
              <Eye className="w-5 h-5" />
              View in Marketplace
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                navigator.clipboard.writeText(generatedDID);
                addToast("DID copied to clipboard!", "success");
              }}
              className="flex-1"
            >
              <Copy className="w-5 h-5" />
              Copy DID
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!deploymentComplete && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-input rounded-lg">
            <div className="w-5 h-5 border-2 border-yuzu border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-sm text-gray-400">
              Step {currentStepIndex + 1} of {steps.length}...
            </span>
          </div>
          <p className="font-mono text-xs text-gray-600 mt-4">
            Do not close this window. This may take a few minutes.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeployProgress;
