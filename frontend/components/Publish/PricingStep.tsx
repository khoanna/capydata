"use client";
import { Check, Coins, DollarSign, Gift, Info, Sparkles, Tag, TrendingUp } from "lucide-react";

import { PublishFormData } from "./PublishWizard";
import { Input } from "@/components/Common/Input";
import CustomSelect from "@/components/Common/CustomSelect";
import { capyToUSD, formatUSD } from "@/lib/utils";

interface PricingStepProps {
  formData: PublishFormData;
  updateFormData: (updates: Partial<PublishFormData>) => void;
}

const PricingStep = ({ formData, updateFormData }: PricingStepProps) => {
  const pricingModels = [
    {
      value: "free" as const,
      icon: <Gift className="w-6 h-6" />,
      label: "Free",
      description: "Open access for everyone",
      details: "No payment required. Great for building reputation and community.",
    },
    {
      value: "fixed" as const,
      icon: <Tag className="w-6 h-6" />,
      label: "Fixed Price",
      description: "Set a one-time purchase price",
      details: "Buyers pay a fixed amount of CAPY tokens for permanent access.",
    },
    // {
    //   value: "dynamic" as const,
    //   icon: <TrendingUp className="w-6 h-6" />,
    //   label: "Dynamic (AMM)",
    //   description: "Automated Market Maker bonding curve",
    //   details: "Price adjusts automatically based on supply and demand. Early buyers get lower prices.",
    // },
  ];

  const licenses = [
    { value: "CC0", label: "CC0 - Public Domain" },
    { value: "CC-BY", label: "CC BY - Attribution Required" },
    { value: "CC-BY-SA", label: "CC BY-SA - Attribution + ShareAlike" },
    { value: "CC-BY-NC", label: "CC BY-NC - Non-Commercial" },
    { value: "MIT", label: "MIT License" },
    { value: "Apache-2.0", label: "Apache License 2.0" },
    { value: "GPL-3.0", label: "GPL 3.0" },
    { value: "Custom", label: "Custom License" },
  ];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateFormData({ price: isNaN(value) ? 0 : value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Pricing Model
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Choose how you want to monetize your dataset.
        </p>
      </div>

      {/* Pricing Model Selection */}
      <div>
        <label className="block font-mono text-xs text-gray-400 mb-3 tracking-wide">
          Pricing Model *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {pricingModels.map((model) => (
            <button
              key={model.value}
              onClick={() => updateFormData({ pricingModel: model.value })}
              className={`p-5 rounded-lg border-2 transition-all text-left group ${
                formData.pricingModel === model.value
                  ? "border-yuzu bg-yuzu/10 scale-105"
                  : "border-white/10 glass-input hover:border-yuzu/50"
              }`}
            >
              {model.icon}
              <p
                className={`font-mono text-sm font-bold mb-2 transition-colors ${
                  formData.pricingModel === model.value
                    ? "text-yuzu"
                    : "text-white"
                }`}
              >
                {model.label}
              </p>
              <p className="font-mono text-xs text-gray-400 mb-3">
                {model.description}
              </p>
              <p className="font-mono text-[10px] text-gray-500 leading-relaxed">
                {model.details}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Price Input (for fixed) */}
      {formData.pricingModel !== "free" && (
        <div className="glass-card p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-yuzu" />
            <h3 className="font-sans font-bold text-white">
              Set Price
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Price (CAPY) *"
              type="number"
              placeholder="50"
              value={formData.price || ""}
              onChange={handlePriceChange}
              hint={
                formData.price > 0
                  ? `≈ ${formatUSD(capyToUSD(formData.price))}`
                  : "Enter amount in CAPY tokens"
              }
              icon={<DollarSign className="w-4 h-4" />}
            />

            {/* Price Breakdown */}
            {formData.price > 0 && (
              <div className="p-4 glass-input rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">You receive</span>
                  <span className="font-mono text-sm text-white font-bold">
                    {(formData.price * 0.97).toFixed(2)} CAPY
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">Platform fee (3%)</span>
                  <span className="font-mono text-sm text-gray-400">
                    {(formData.price * 0.03).toFixed(2)} CAPY
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-white font-bold">Buyer pays</span>
                    <span className="font-mono text-lg text-yuzu font-bold">
                      {formData.price} CAPY
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Free Model Benefits */}
      {formData.pricingModel === "free" && (
        <div className="p-6 glass-card rounded-lg border border-success/30">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-success" />
            <div>
              <h3 className="font-sans font-bold text-white mb-2">
                Free Access Benefits
              </h3>
              <p className="font-mono text-xs text-gray-400 leading-relaxed">
                Making your dataset free can help you build reputation and reach a wider audience.
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {[
              "Build your reputation in the community",
              "Get more downloads and visibility",
              "Earn governance tokens based on usage",
              "Qualify for data farming rewards",
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span className="font-mono text-xs text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* License Selection */}
      <CustomSelect
        label="License *"
        value={formData.license}
        onChange={(value) => updateFormData({ license: value })}
        options={licenses}
        hint="Specify how others can use your dataset"
        icon={<FileText className="w-4 h-4" />}
      />

      {/* License Info */}
      <div className="p-4 glass-input rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-mono text-sm text-white mb-2">
              About Licenses
            </p>
            <p className="font-mono text-xs text-gray-400 leading-relaxed">
              Choose a license that matches your goals. Creative Commons licenses are ideal
              for datasets. Open source licenses (MIT, Apache, GPL) work well for algorithms.
              Custom licenses allow you to define specific terms.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Projection (for paid models) */}
      {formData.pricingModel !== "free" && formData.price > 0 && (
        <div className="glass-card p-6 rounded-lg border border-yuzu/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-yuzu" />
            <h3 className="font-sans font-bold text-white">
              Revenue Projection
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "10 sales", value: formData.price * 10 * 0.97 },
              { label: "50 sales", value: formData.price * 50 * 0.97 },
              { label: "100 sales", value: formData.price * 100 * 0.97 },
            ].map((projection, i) => (
              <div key={i} className="text-center">
                <p className="font-mono text-xs text-gray-400 mb-1">
                  {projection.label}
                </p>
                <p className="font-sans text-lg font-bold text-yuzu">
                  {projection.value.toFixed(0)}
                </p>
                <p className="font-mono text-[10px] text-gray-500">
                  {formatUSD(capyToUSD(projection.value))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingStep;
