"use client";
import { Calendar, Check, Coins, Database, FileText, Tag } from "lucide-react";
import { PublishFormData } from "./PublishWizard";
import { formatUSD, suiToUSD, calculatePlatformFee } from "@/lib/utils";

interface ReviewStepProps {
  formData: PublishFormData;
}

const ReviewStep = ({ formData }: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Review & Confirm
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Please review your dataset details before publishing.
        </p>
      </div>

      {/* Dataset Information */}
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-hydro" />
          <h3 className="font-sans font-bold text-white">Dataset Information</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-gray-400">Title</label>
            <p className="font-mono text-sm text-white mt-1">{formData.title}</p>
          </div>
          
          <div>
            <label className="font-mono text-xs text-gray-400">Description</label>
            <p className="font-mono text-sm text-white mt-1 leading-relaxed">
              {formData.description}
            </p>
          </div>
          
          {formData.tags.length > 0 && (
            <div>
              <label className="font-mono text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 glass-input rounded-full border border-hydro/30 font-mono text-xs text-hydro"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Details */}
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-yuzu" />
          <h3 className="font-sans font-bold text-white">File Details</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-gray-400">Filename</label>
            <p className="font-mono text-sm text-white mt-1">{formData.filename}</p>
          </div>
          
          <div>
            <label className="font-mono text-xs text-gray-400">File Type</label>
            <p className="font-mono text-sm text-white mt-1">{formData.filetype}</p>
          </div>
          
          {formData.uploadedFile && (
            <div>
              <label className="font-mono text-xs text-gray-400">File Size</label>
              <p className="font-mono text-sm text-white mt-1">
                {(formData.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
          
          <div>
            <label className="font-mono text-xs text-gray-400">Release Date</label>
            <p className="font-mono text-sm text-white mt-1">
              {new Date(formData.releaseDate || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-yuzu" />
          <h3 className="font-sans font-bold text-white">Pricing</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-gray-400">Model</label>
            <p className="font-mono text-sm text-white mt-1 capitalize">
              {formData.pricingModel}
            </p>
          </div>
          
          {formData.pricingModel !== "free" && (() => {
            const feeInfo = calculatePlatformFee(formData.price);
            return (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs text-gray-400">Price</label>
                    <p className="font-sans text-2xl font-bold text-yuzu mt-1">
                      {formData.price} SUI
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      ≈ {formatUSD(suiToUSD(formData.price))}
                    </p>
                  </div>

                  <div>
                    <label className="font-mono text-xs text-gray-400">You Receive</label>
                    <p className="font-sans text-2xl font-bold text-white mt-1">
                      {feeInfo.received.toFixed(4)} SUI
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      After {feeInfo.feePercentage} platform fee
                    </p>
                  </div>
                </div>
                {feeInfo.feeRate === 1.0 && (
                  <div className="p-3 bg-amber-400/10 rounded border border-amber-400/30">
                    <p className="font-mono text-xs text-amber-400">
                      ⚠️ Note: Price ≤100 MIST — 100% platform fee applies. Consider pricing higher to receive payment.
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Confirmation Checklist */}
      <div className="p-6 glass-card rounded-lg border border-yuzu/30">
        <h3 className="font-sans font-bold text-white mb-4">Before Publishing</h3>
        <ul className="space-y-3">
          {[
            "All information is accurate and complete",
            "File has been properly uploaded",
            "Pricing is set correctly",
            "You own the rights to this dataset",
            "Dataset complies with platform guidelines",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-yuzu/50 flex items-center justify-center">
                <Check className="w-3 h-3 text-yuzu" />
              </div>
              <span className="font-mono text-xs text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Warning */}
      <div className="p-4 glass-input rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-info/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-info font-bold text-xs">!</span>
          </div>
          <div>
            <p className="font-mono text-sm text-white mb-2 font-bold">
              Important Notice
            </p>
            <p className="font-mono text-xs text-gray-400 leading-relaxed">
              Once published, your dataset will be encrypted and stored on the Walrus network.
              Metadata will be recorded on the Sui blockchain. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
