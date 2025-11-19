"use client";

import { PublishFormData } from "./PublishWizard";
import { Input } from "@/components/Common/Input";
import Badge from "@/components/Common/Badge";
import { useState } from "react";

interface AdvancedSettingsStepProps {
  formData: PublishFormData;
  updateFormData: (updates: Partial<PublishFormData>) => void;
}

const AdvancedSettingsStep = ({ formData, updateFormData }: AdvancedSettingsStepProps) => {
  const [allowListInput, setAllowListInput] = useState("");
  const [algorithmInput, setAlgorithmInput] = useState("");

  const handleAddToAllowList = () => {
    if (allowListInput.trim() && !formData.allowList.includes(allowListInput.trim())) {
      updateFormData({ allowList: [...formData.allowList, allowListInput.trim()] });
      setAllowListInput("");
    }
  };

  const handleRemoveFromAllowList = (address: string) => {
    updateFormData({ allowList: formData.allowList.filter((a) => a !== address) });
  };

  const handleAddAlgorithm = () => {
    if (algorithmInput.trim() && !formData.whitelistedAlgorithms.includes(algorithmInput.trim())) {
      updateFormData({
        whitelistedAlgorithms: [...formData.whitelistedAlgorithms, algorithmInput.trim()],
      });
      setAlgorithmInput("");
    }
  };

  const handleRemoveAlgorithm = (did: string) => {
    updateFormData({
      whitelistedAlgorithms: formData.whitelistedAlgorithms.filter((a) => a !== did),
    });
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    handler: () => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Advanced Settings
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Configure access controls, compute-to-data, and other advanced options.
        </p>
      </div>

      {/* Access Type */}
      <div>
        <label className="block font-mono text-xs text-gray-400 mb-3 tracking-wide">
          Access Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => updateFormData({ accessType: "download" })}
            className={`p-5 rounded-lg border-2 transition-all text-left group ${
              formData.accessType === "download"
                ? "border-yuzu bg-yuzu/10"
                : "border-white/10 glass-input hover:border-yuzu/50"
            }`}
          >
            <i
              data-lucide="download"
              className={`w-7 h-7 mb-3 transition-colors ${
                formData.accessType === "download"
                  ? "text-yuzu"
                  : "text-gray-400 group-hover:text-yuzu"
              }`}
            ></i>
            <p
              className={`font-mono text-sm font-bold mb-2 transition-colors ${
                formData.accessType === "download" ? "text-yuzu" : "text-white"
              }`}
            >
              Download Access
            </p>
            <p className="font-mono text-xs text-gray-400 leading-relaxed">
              Buyers can download the raw dataset after purchase. Standard access model
              with full data ownership transfer.
            </p>
          </button>

          <button
            onClick={() => updateFormData({ accessType: "compute" })}
            className={`p-5 rounded-lg border-2 transition-all text-left group ${
              formData.accessType === "compute"
                ? "border-yuzu bg-yuzu/10"
                : "border-white/10 glass-input hover:border-yuzu/50"
            }`}
          >
            <i
              data-lucide="cpu"
              className={`w-7 h-7 mb-3 transition-colors ${
                formData.accessType === "compute"
                  ? "text-yuzu"
                  : "text-gray-400 group-hover:text-yuzu"
              }`}
            ></i>
            <p
              className={`font-mono text-sm font-bold mb-2 transition-colors ${
                formData.accessType === "compute" ? "text-yuzu" : "text-white"
              }`}
            >
              Compute-to-Data (C2D)
            </p>
            <p className="font-mono text-xs text-gray-400 leading-relaxed">
              Data stays private. Buyers run algorithms on your data without downloading it.
              Maximum privacy protection.
            </p>
          </button>
        </div>
      </div>

      {/* C2D Options */}
      {formData.accessType === "compute" && (
        <div className="glass-card p-6 rounded-lg border border-hydro/30 space-y-6">
          <div className="flex items-start gap-3">
            <i data-lucide="shield-check" className="w-6 h-6 text-hydro flex-shrink-0"></i>
            <div>
              <h3 className="font-sans font-bold text-white mb-2">
                Compute-to-Data Configuration
              </h3>
              <p className="font-mono text-xs text-gray-400 leading-relaxed">
                Control which algorithms can be run on your dataset and monitor all computations.
              </p>
            </div>
          </div>

          {/* Whitelisted Algorithms */}
          <div>
            <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
              Approved Algorithms
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter algorithm DID or address"
                value={algorithmInput}
                onChange={(e) => setAlgorithmInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddAlgorithm)}
                hint="Specify which algorithms can run on your data"
                icon={<i data-lucide="code" className="w-4 h-4"></i>}
              />
              <button
                onClick={handleAddAlgorithm}
                className="px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2 font-mono text-sm text-white flex-shrink-0"
              >
                <i data-lucide="plus" className="w-4 h-4"></i>
                Add
              </button>
            </div>

            {formData.whitelistedAlgorithms.length > 0 ? (
              <div className="space-y-2">
                {formData.whitelistedAlgorithms.map((did) => (
                  <div
                    key={did}
                    className="flex items-center justify-between p-3 glass-input rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <i data-lucide="cpu" className="w-4 h-4 text-hydro flex-shrink-0"></i>
                      <span className="font-mono text-xs text-white truncate">
                        {did}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAlgorithm(did)}
                      className="ml-2 p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                    >
                      <i data-lucide="x" className="w-4 h-4 text-gray-400"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 glass-input rounded-lg text-center">
                <i data-lucide="inbox" className="w-8 h-8 text-gray-600 mx-auto mb-2"></i>
                <p className="font-mono text-xs text-gray-500">
                  No algorithms whitelisted. Any algorithm can be used.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sample Data */}
      <div className="glass-card p-5 rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <i data-lucide="eye" className="w-5 h-5 text-grass mt-0.5"></i>
            <div>
              <p className="font-mono text-sm text-white font-bold mb-1">
                Provide Sample Data
              </p>
              <p className="font-mono text-xs text-gray-400 leading-relaxed">
                Allow potential buyers to preview a sample of your dataset before purchasing.
                This can increase trust and sales.
              </p>
            </div>
          </div>
          <button
            onClick={() => updateFormData({ sampleAvailable: !formData.sampleAvailable })}
            className={`relative w-14 h-7 rounded-full transition-all flex-shrink-0 ${
              formData.sampleAvailable ? "bg-grass" : "bg-white/20"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                formData.sampleAvailable ? "left-8" : "left-1"
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Access Control (Allow List) */}
      <div>
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          Access Control (Optional)
        </label>
        <p className="font-mono text-xs text-gray-500 mb-3">
          Restrict who can purchase this dataset. Leave empty for public access.
        </p>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Enter Sui address (0x...)"
            value={allowListInput}
            onChange={(e) => setAllowListInput(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleAddToAllowList)}
            hint="Only these addresses can purchase"
            icon={<i data-lucide="user-check" className="w-4 h-4"></i>}
          />
          <button
            onClick={handleAddToAllowList}
            className="px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2 font-mono text-sm text-white flex-shrink-0"
          >
            <i data-lucide="plus" className="w-4 h-4"></i>
            Add
          </button>
        </div>

        {formData.allowList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.allowList.map((address) => (
              <Badge key={address} variant="type" size="md">
                {address.slice(0, 8)}...{address.slice(-6)}
                <button
                  onClick={() => handleRemoveFromAllowList(address)}
                  className="ml-2 hover:text-error transition-colors"
                >
                  <i data-lucide="x" className="w-3 h-3"></i>
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="p-4 glass-input rounded-lg text-center">
            <i data-lucide="globe" className="w-8 h-8 text-gray-600 mx-auto mb-2"></i>
            <p className="font-mono text-xs text-gray-500">
              Public access - anyone can purchase
            </p>
          </div>
        )}
      </div>

      {/* Expiration Date */}
      <div>
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          Listing Expiration (Optional)
        </label>
        <Input
          type="date"
          value={formData.expirationDate || ""}
          onChange={(e) => updateFormData({ expirationDate: e.target.value })}
          hint="Leave empty for permanent listing"
          icon={<i data-lucide="calendar" className="w-4 h-4"></i>}
        />
      </div>

      {/* Privacy & Security Notice */}
      <div className="p-4 glass-input rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <i data-lucide="shield" className="w-5 h-5 text-info mt-0.5"></i>
          <div>
            <p className="font-mono text-sm text-white mb-2 font-bold">
              Privacy & Security
            </p>
            <ul className="space-y-1">
              {[
                "All data is encrypted with Seal protocol before storage",
                "Access tokens are managed on-chain via smart contracts",
                "C2D computations run in isolated environments",
                "You can revoke access or update settings anytime",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <i data-lucide="check" className="w-3 h-3 text-success mt-0.5 flex-shrink-0"></i>
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

export default AdvancedSettingsStep;
