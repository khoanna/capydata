"use client";

import { PublishFormData } from "./PublishWizard";
import { Input } from "@/components/Common/Input";
import { useState } from "react";
import { formatFileSize } from "@/lib/utils";

interface AssetLocationStepProps {
  formData: PublishFormData;
  updateFormData: (updates: Partial<PublishFormData>) => void;
}

const AssetLocationStep = ({ formData, updateFormData }: AssetLocationStepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const storageOptions = [
    {
      type: "url" as const,
      icon: "link",
      label: "URL",
      description: "Link to data hosted elsewhere",
    },
    {
      type: "ipfs" as const,
      icon: "cloud",
      label: "IPFS",
      description: "InterPlanetary File System CID",
    },
    {
      type: "arweave" as const,
      icon: "archive",
      label: "Arweave",
      description: "Permanent storage transaction ID",
    },
    {
      type: "upload" as const,
      icon: "upload",
      label: "Upload File",
      description: "Upload to Walrus network",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({
        uploadedFile: file,
        locationValue: file.name
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      updateFormData({
        uploadedFile: file,
        locationValue: file.name
      });
    }
  };

  const handleRemoveFile = () => {
    updateFormData({
      uploadedFile: undefined,
      locationValue: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Asset Location
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Specify where your dataset is stored. All data will be encrypted with Seal protocol.
        </p>
      </div>

      {/* Storage Type Selection */}
      <div>
        <label className="block font-mono text-xs text-gray-400 mb-3 tracking-wide">
          Storage Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {storageOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => updateFormData({ locationType: option.type })}
              className={`p-4 rounded-lg border-2 transition-all text-left group ${
                formData.locationType === option.type
                  ? "border-yuzu bg-yuzu/10"
                  : "border-white/10 glass-input hover:border-yuzu/50"
              }`}
            >
              <i
                data-lucide={option.icon}
                className={`w-6 h-6 mb-2 transition-colors ${
                  formData.locationType === option.type
                    ? "text-yuzu"
                    : "text-gray-400 group-hover:text-yuzu"
                }`}
              ></i>
              <p
                className={`font-mono text-sm font-bold mb-1 transition-colors ${
                  formData.locationType === option.type
                    ? "text-yuzu"
                    : "text-white"
                }`}
              >
                {option.label}
              </p>
              <p className="font-mono text-xs text-gray-500">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* URL Input */}
      {formData.locationType === "url" && (
        <Input
          label="Data URL *"
          placeholder="https://example.com/dataset.csv"
          value={formData.locationValue}
          onChange={(e) => updateFormData({ locationValue: e.target.value })}
          hint="Must be publicly accessible or use authentication headers"
          icon={<i data-lucide="globe" className="w-4 h-4"></i>}
        />
      )}

      {/* IPFS Input */}
      {formData.locationType === "ipfs" && (
        <Input
          label="IPFS CID *"
          placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
          value={formData.locationValue}
          onChange={(e) => updateFormData({ locationValue: e.target.value })}
          hint="Content Identifier on IPFS network"
          icon={<i data-lucide="hash" className="w-4 h-4"></i>}
        />
      )}

      {/* Arweave Input */}
      {formData.locationType === "arweave" && (
        <Input
          label="Arweave TX ID *"
          placeholder="6I-wDvp-bSZdBS_LrfAVgdFI6K6B5N5C3f6l1XvZ5nU"
          value={formData.locationValue}
          onChange={(e) => updateFormData({ locationValue: e.target.value })}
          hint="Transaction ID on Arweave network"
          icon={<i data-lucide="shield" className="w-4 h-4"></i>}
        />
      )}

      {/* File Upload */}
      {formData.locationType === "upload" && (
        <div>
          <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
            Upload File *
          </label>

          {!formData.uploadedFile ? (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer group ${
                isDragging
                  ? "border-yuzu bg-yuzu/10 scale-105"
                  : "border-white/20 glass-input hover:border-yuzu/50"
              }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                    isDragging
                      ? "bg-yuzu/20 scale-110"
                      : "bg-white/5 group-hover:bg-yuzu/10"
                  }`}
                >
                  <i
                    data-lucide="upload-cloud"
                    className={`w-8 h-8 transition-colors ${
                      isDragging
                        ? "text-yuzu"
                        : "text-gray-400 group-hover:text-yuzu"
                    }`}
                  ></i>
                </div>
                <p className="font-mono text-sm text-white mb-2">
                  Drop your file here, or{" "}
                  <span className="text-yuzu">browse</span>
                </p>
                <p className="font-mono text-xs text-gray-500">
                  Supports: CSV, JSON, Parquet, HDF5, ZIP (max 5GB)
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yuzu/20 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="file" className="w-6 h-6 text-yuzu"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-white font-bold mb-1 truncate">
                    {formData.uploadedFile.name}
                  </p>
                  <p className="font-mono text-xs text-gray-400">
                    {formatFileSize(formData.uploadedFile.size)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yuzu to-hydro animate-shimmer"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                    <span className="font-mono text-xs text-success">
                      Ready
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <i data-lucide="x" className="w-5 h-5 text-gray-400"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Encryption Notice */}
      <div className="p-4 glass-input rounded-lg border border-hydro/30">
        <div className="flex items-start gap-3">
          <i data-lucide="lock" className="w-5 h-5 text-hydro mt-0.5 flex-shrink-0"></i>
          <div>
            <p className="font-mono text-sm text-white mb-2 font-bold">
              Seal Protocol Encryption
            </p>
            <p className="font-mono text-xs text-gray-400 leading-relaxed">
              Your data will be encrypted using Seal protocol before being stored.
              Only buyers with access tokens can decrypt and view the content.
            </p>
          </div>
        </div>
      </div>

      {/* Walrus Storage Notice (for uploads) */}
      {formData.locationType === "upload" && (
        <div className="p-4 glass-input rounded-lg border border-grass/30">
          <div className="flex items-start gap-3">
            <i data-lucide="database" className="w-5 h-5 text-grass mt-0.5 flex-shrink-0"></i>
            <div>
              <p className="font-mono text-sm text-white mb-2 font-bold">
                Walrus Decentralized Storage
              </p>
              <p className="font-mono text-xs text-gray-400 leading-relaxed">
                Files will be uploaded to the Walrus network for decentralized,
                redundant storage. Storage fees are included in the listing price.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetLocationStep;
