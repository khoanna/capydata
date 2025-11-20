"use client";
import { Check, FileText, Lock, UploadCloud, X } from "lucide-react";

import { PublishFormData } from "./PublishWizard";
import { useState } from "react";
import { formatFileSize } from "@/lib/utils";

interface AssetLocationStepProps {
  formData: PublishFormData;
  updateFormData: (updates: Partial<PublishFormData>) => void;
}

const AssetLocationStep = ({ formData, updateFormData }: AssetLocationStepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({
        uploadedFile: file,
        filename: file.name,
        filetype: file.type || "application/octet-stream"
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
        filename: file.name,
        filetype: file.type || "application/octet-stream"
      });
    }
  };

  const handleRemoveFile = () => {
    updateFormData({
      uploadedFile: undefined,
      filename: "",
      filetype: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Upload File
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Upload your dataset file. All data will be encrypted with Seal protocol before being stored on Walrus network.
        </p>
      </div>

      {!formData.uploadedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${isDragging ? "border-yuzu bg-yuzu/10" : "border-white/20 hover:border-yuzu/50 bg-white/5"}`}
        >
          <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept=".csv,.json,.parquet,.hdf5,.zip" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-yuzu/20 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-yuzu" />
            </div>
            <p className="font-sans text-lg font-bold text-white mb-2">
              Drop your file here, or <span className="text-yuzu">browse</span>
            </p>
            <p className="font-mono text-xs text-gray-400">Supports: CSV, JSON, Parquet, HDF5, ZIP (max 5GB)</p>
          </label>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-lg border border-success/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-bold text-white truncate">{formData.uploadedFile.name}</p>
                  <p className="font-mono text-xs text-gray-400">{formatFileSize(formData.uploadedFile.size)} • {formData.filetype}</p>
                </div>
                <button onClick={handleRemoveFile} className="p-2 hover:bg-error/10 rounded-lg transition-colors shrink-0">
                  <X className="w-4 h-4 text-gray-400 hover:text-error" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-success">
                <Check className="w-4 h-4" />
                <span className="font-mono text-xs">Ready to upload</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 glass-input rounded-lg border border-info/30">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-info mt-0.5 shrink-0" />
          <div>
            <p className="font-mono text-sm text-white mb-2 font-bold">Seal Protocol Encryption</p>
            <p className="font-mono text-xs text-gray-400 leading-relaxed">Your data will be encrypted using Seal protocol before being stored. Only buyers with valid access tokens can decrypt and view the content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLocationStep;
