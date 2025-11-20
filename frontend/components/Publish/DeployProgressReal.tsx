/**
 * DeployProgress - REAL IMPLEMENTATION with Seal + Walrus
 * Replaces mock deployment with actual blockchain transactions
 */

"use client";

import { PublishFormData } from "./PublishWizard";
import { useState, useEffect } from "react";
import Button from "@/components/Common/Button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useSealWalrus } from "@/hooks/useSealWalrus";
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { config } from '@/lib/config';
import { useInvalidateMarketplace } from '@/hooks/useMarketplace';

interface DeployProgressProps {
  formData: PublishFormData;
}

type DeployStep = {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: "pending" | "processing" | "complete" | "error";
  txHash?: string;
  errorMessage?: string;
};

const DeployProgressReal = ({ formData }: DeployProgressProps) => {
  const router = useRouter();
  const { addToast } = useToast();
  const { publishDataset, progress, error: sealError } = useSealWalrus();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const { invalidateAllDatasets } = useInvalidateMarketplace();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [datasetId, setDatasetId] = useState("");
  const [allowlistId, setAllowlistId] = useState("");
  const [capId, setCapId] = useState("");

  const [steps, setSteps] = useState<DeployStep[]>([
    {
      id: 1,
      title: "Create Allowlist",
      description: "Creating access control list on Sui",
      icon: "shield",
      status: "pending",
    },
    {
      id: 2,
      title: "Encrypt & Upload",
      description: "Encrypting with Seal and uploading to Walrus",
      icon: "lock",
      status: "pending",
    },
    {
      id: 3,
      title: "Publish Dataset",
      description: "Creating dataset object on-chain",
      icon: "database",
      status: "pending",
    },
  ]);

  useEffect(() => {
    // Auto-start deployment
    executeDeployment();
  }, []);

  const executeDeployment = async () => {
    if (!currentAccount) {
      setStepError(0, "Wallet not connected");
      return;
    }

    if (!formData.uploadedFile) {
      setStepError(0, "No file uploaded");
      return;
    }

    try {
      // STEP 1: Create Allowlist
      await executeStep1_CreateAllowlist();

      // STEP 2: Encrypt & Upload
      await executeStep2_EncryptUpload();

      // STEP 3: Publish Dataset
      await executeStep3_PublishDataset();

      // Success!
      setDeploymentComplete(true);
      addToast("Dataset published successfully!", "success");

      // Invalidate cache to refresh marketplace data
      invalidateAllDatasets();
    } catch (error) {
      console.error('Deployment error:', error);
      addToast("Deployment failed. See console for details.", "error");
    }
  };

  /**
   * STEP 1: Create Allowlist on Sui
   */
  const executeStep1_CreateAllowlist = async () => {
    setStepProcessing(0);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${config.marketplacePackageId}::allowlist::create_allowlist_entry`,
        arguments: [
          tx.pure.string(`${formData.title} - Access List`),
        ],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });

      // Extract created objects from transaction effects
      const created = result.effects?.created || [];

      const capObject = created.find((obj) =>
        obj.owner && 'AddressOwner' in obj.owner
      );
      const allowlistObject = created.find((obj) =>
        obj.owner && 'Shared' in obj.owner
      );

      if (!capObject || !allowlistObject) {
        throw new Error('Failed to find created allowlist objects');
      }

      const newAllowlistId = allowlistObject.reference.objectId;
      const newCapId = capObject.reference.objectId;

      setAllowlistId(newAllowlistId);
      setCapId(newCapId);

      setStepComplete(0, result.digest);
      addToast("Allowlist created", "success", result.digest);
    } catch (error: any) {
      setStepError(0, error.message || "Failed to create allowlist");
      throw error;
    }
  };

  /**
   * STEP 2: Encrypt with Seal & Upload to Walrus
   */
  const executeStep2_EncryptUpload = async () => {
    setStepProcessing(1);

    try {
      if (!formData.uploadedFile) {
        throw new Error('No file to upload');
      }

      // Generate unique dataset ID from file name + timestamp
      const datasetId = `${formData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

      const result = await publishDataset({
        file: formData.uploadedFile,
        allowlistId: allowlistId,
        datasetId: datasetId,
      });

      // Store blobId for next step
      setDatasetId(datasetId);

      setStepComplete(1, result.blobId);
      addToast("Dataset encrypted and uploaded", "success");

      // Store result in component state for next step
      (window as any).__publishResult = result;
    } catch (error: any) {
      setStepError(1, error.message || "Failed to encrypt and upload");
      throw error;
    }
  };

  /**
   * STEP 3: Publish Dataset on Marketplace
   */
  const executeStep3_PublishDataset = async () => {
    setStepProcessing(2);

    try {
      const publishResult = (window as any).__publishResult;
      if (!publishResult) {
        throw new Error('Missing publish result from previous step');
      }

      const tx = new Transaction();

      // Convert price from SUI to MIST
      const priceInMist = Math.floor(formData.price * 1_000_000_000);

      tx.moveCall({
        target: `${config.marketplacePackageId}::marketplace::publish_dataset_entry`,
        arguments: [
          tx.pure.string(formData.title),
          tx.pure.string(formData.description),
          tx.object(allowlistId),
          tx.object(capId),
          tx.pure.string(publishResult.blobId),
          tx.pure.u64(priceInMist),
          tx.pure.u64(publishResult.encryptedObjectMetadata.threshold),
          tx.pure.u64(publishResult.encryptedObjectMetadata.kemType),
          tx.pure.u64(publishResult.encryptedObjectMetadata.demType),
        ],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });

      // Extract dataset ID from created objects
      const created = result.effects?.created || [];
      const datasetObject = created.find((obj) =>
        obj.owner && 'Shared' in obj.owner
      );

      if (!datasetObject) {
        throw new Error('Failed to find created dataset object');
      }

      const newDatasetId = datasetObject.reference.objectId;

      setStepComplete(2, result.digest);
      addToast("Dataset published on marketplace", "success", result.digest);

      // Store dataset ID for redirect
      setDatasetId(newDatasetId);

      // Clean up temp data
      delete (window as any).__publishResult;
    } catch (error: any) {
      setStepError(2, error.message || "Failed to publish dataset");
      throw error;
    }
  };

  // Helper functions to update step status
  const setStepProcessing = (index: number) => {
    setCurrentStepIndex(index);
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === index ? { ...step, status: "processing" as const } : step
      )
    );
  };

  const setStepComplete = (index: number, txHash: string) => {
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === index ? { ...step, status: "complete" as const, txHash } : step
      )
    );
  };

  const setStepError = (index: number, errorMessage: string) => {
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === index ? { ...step, status: "error" as const, errorMessage } : step
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="space-y-6 mb-12">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              p-6 rounded-2xl border-2 transition-all duration-300
              ${
                step.status === "complete"
                  ? "border-grass bg-grass/10"
                  : step.status === "processing"
                  ? "border-yuzu bg-yuzu/10"
                  : step.status === "error"
                  ? "border-red-500 bg-red-500/10"
                  : "border-border bg-panel"
              }
            `}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                ${
                  step.status === "complete"
                    ? "bg-grass"
                    : step.status === "processing"
                    ? "bg-yuzu"
                    : step.status === "error"
                    ? "bg-red-500"
                    : "bg-panel border-2 border-border"
                }
              `}
              >
                <i
                  data-lucide={
                    step.status === "complete"
                      ? "check"
                      : step.status === "error"
                      ? "x"
                      : step.icon
                  }
                  className={`
                    w-6 h-6
                    ${
                      step.status === "complete" ||
                      step.status === "processing" ||
                      step.status === "error"
                        ? "text-void"
                        : "text-gray-400"
                    }
                  `}
                ></i>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  {step.status === "error" && step.errorMessage
                    ? step.errorMessage
                    : step.description}
                </p>

                {/* Processing indicator */}
                {step.status === "processing" && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm text-yuzu">
                      <div className="w-4 h-4 border-2 border-yuzu border-t-transparent rounded-full animate-spin"></div>
                      <span>{progress.message || "Processing..."}</span>
                    </div>
                    {progress.percent > 0 && (
                      <div className="mt-2 bg-void/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-yuzu transition-all duration-300"
                          style={{ width: `${progress.percent}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Transaction hash */}
                {step.status === "complete" && step.txHash && (
                  <div className="mt-3 font-mono text-xs text-grass break-all">
                    Tx: {step.txHash.slice(0, 16)}...{step.txHash.slice(-8)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {deploymentComplete && (
        <div className="p-8 rounded-2xl border-2 border-grass bg-grass/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-grass flex items-center justify-center">
              <i data-lucide="check" className="w-6 h-6 text-void"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Dataset Published Successfully!
              </h3>
              <p className="text-sm text-gray-400">
                Your dataset is now live on the marketplace
              </p>
            </div>
          </div>

          {datasetId && (
            <div className="mt-4 p-4 rounded-lg bg-void/50 font-mono text-xs text-grass break-all">
              Dataset ID: {datasetId}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {deploymentComplete ? (
          <>
            <Button onClick={() => router.push(`/item/${datasetId}`)}>
              View Dataset
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/marketplace")}
            >
              Browse Marketplace
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => router.push("/publish")}>
            Cancel
          </Button>
        )}
      </div>

      {/* Error Message */}
      {sealError && (
        <div className="mt-8 p-4 rounded-lg border-2 border-red-500 bg-red-500/10">
          <p className="text-sm text-red-500">{sealError}</p>
        </div>
      )}
    </div>
  );
};

export default DeployProgressReal;
