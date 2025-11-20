"use client";

import { PublishFormData } from "./PublishWizard";
import { Input } from "@/components/Common/Input";
import Badge from "@/components/Common/Badge";
import { useState } from "react";
import { Calendar, Check, Code, Cpu, Download, Eye, Globe, Inbox, Plus, Shield, ShieldCheck, UserCheck, X } from "lucide-react";


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
            <Download  />
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
            <Cpu  />
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
            <ShieldCheck className="w-6 h-6 text-hydro shrink-0" />
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
                icon={<Code className="w-4 h-4" />}
              />
              <button
                onClick={handleAddAlgorithm}
                className="px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2 font-mono text-sm text-white shrink-0"
              >
                <Plus className="w-4 h-4" />
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
                      <Cpu className="w-4 h-4 text-hydro shrink-0" />
                      <span className="font-mono text-xs text-white truncate">
                        {did}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAlgorithm(did)}
                      className="ml-2 p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 glass-input rounded-lg text-center">
                <Inbox className="w-8 h-8 text-gray-600 mx-auto mb-2" />
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
            <Eye className="w-5 h-5 text-grass mt-0.5" />
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
            className={`relative w-14 h-7 rounded-full transition-all shrink-0 ${
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
            icon={<UserCheck className="w-4 h-4" />}
          />
          <button
            onClick={handleAddToAllowList}
            className="px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2 font-mono text-sm text-white shrink-0"
          >
            <Plus className="w-4 h-4" />
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
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="p-4 glass-input rounded-lg text-center">
            <Globe className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="font-mono text-xs text-gray-500">
              Public access - anyone can purchase
            </p>
          </div>
        )}
      </div>

      {/* Expiration Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
            Release Date (Optional)
          </label>
          <Input
            type="date"
            value={formData.releaseDate ? new Date(formData.releaseDate).toISOString().split('T')[0] : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value).getTime() : Date.now();
              updateFormData({ releaseDate: date });
            }}
            hint="When was this dataset created/collected?"
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
            Listing Expiration (Optional)
          </label>
          <Input
            type="date"
            value={formData.expirationDate || ""}
            onChange={(e) => updateFormData({ expirationDate: e.target.value })}
            hint="Leave empty for permanent listing"
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Privacy & Security Notice */}
      <div className="p-4 glass-input rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-info mt-0.5" />
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

export default AdvancedSettingsStep;
