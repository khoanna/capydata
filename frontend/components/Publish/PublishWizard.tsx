"use client";

import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Database, 
  DollarSign, 
  FileText, 
  Rocket, 
  Settings, 
} from "lucide-react";

import { useState } from "react";
import Button from "@/components/Common/Button";
import useMarketplace from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/useToast";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Assuming these components exist in your project structure
import MetadataStep from "./MetadataStep";
import AssetLocationStep from "./AssetLocationStep";
import PricingStep from "./PricingStep";
import ReviewStep from "./ReviewStep";
import DeployProgress from "./DeployProgress";
import { useAppContext } from "@/context/AppContext";
import { suiToMist } from "@/lib/utils";

export interface PublishFormData {
  // Metadata
  title: string;
  description: string;
  tags: string[];

  // Asset Location
  uploadedFile?: File;
  filename: string;
  filetype: string;

  // Pricing
  pricingModel: "free" | "fixed";
  price: number;

  // Advanced
  releaseDate?: number;
}

const INITIAL_FORM_DATA: PublishFormData = {
  title: "",
  description: "",
  tags: [],
  filename: "",
  filetype: "",
  pricingModel: "fixed",
  price: 0,
  releaseDate: Date.now(),
};

const PublishWizard = () => {
  const { fetchListings } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PublishFormData>(INITIAL_FORM_DATA);
  const [isDeploying, setIsDeploying] = useState(false);
  const [txResult, setTxResult] = useState<{digest: string; effects?: any} | null>(null);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const { uploadFile, loading, isReady } = useMarketplace();
  const { addToast } = useToast();
  const currentAccount = useCurrentAccount();

  const steps = [
    { number: 1, title: "METADATA", icon: <FileText className="w-4 h-4" />, sub: "Describe Asset" },
    { number: 2, title: "SOURCE", icon: <Database className="w-4 h-4" />, sub: "Upload/Link" },
    { number: 3, title: "VALUE", icon: <DollarSign className="w-4 h-4" />, sub: "Set Price" },
    { number: 4, title: "REVIEW", icon: <Settings className="w-4 h-4" />, sub: "Check Details" },
    { number: 5, title: "DEPLOY", icon: <Rocket className="w-4 h-4" />, sub: "Launch" },
  ];

  const updateFormData = (updates: Partial<PublishFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description;
      case 2:
        return formData.uploadedFile && formData.filename && formData.filetype;
      case 3:
        return formData.pricingModel === "free" || formData.price > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleDeploy = async () => {
    if (!canProceed()) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (!currentAccount) {
      addToast("Please connect your wallet first", "error");
      return;
    }

    if (!isReady) {
      addToast("Walrus SDK is not ready. Please wait...", "error");
      return;
    }

    if (!formData.uploadedFile) {
      addToast("Please upload a file", "error");
      return;
    }

    setIsDeploying(true);
    
    try {
      addToast("Encrypting and uploading file to Walrus network...", "info");
      const actualPrice = formData.pricingModel === "free" ? 0 : formData.price;
      
      const result = await uploadFile(
        formData.uploadedFile,
        formData.title,
        formData.filename,
        formData.filetype,
        formData.description,
        formData.tags,
        suiToMist(actualPrice)
      );
      await fetchListings();
      setTxResult(result);
      addToast("Dataset published successfully!", "success");
      
      // Move to deploy step to show success
      setCurrentStep(5);
      
    } catch (error) {
      console.error("Deployment error:", error);
      addToast(`Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploymentComplete = () => {
    setIsDeploying(false);
    // You can add additional logic here, like redirecting to the marketplace
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setIsDeploying(false);
  };

  const handleNext = async () => {
    if (!canProceed()) {
      addToast("Please complete all required fields", "error");
      return;
    }

    if (currentStep === 4) {
      await handleDeploy();
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      
      {/* Header / Status Bar */}
      <div className="flex justify-between items-end mb-8 font-mono text-xs text-gray-500 border-b border-white/10 pb-4">
        <div>
          <span className="text-yuzu">Protocol:</span> V3.0.1 (BETA)
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentStep === 5 ? 'bg-green-500 animate-pulse' : 'bg-yuzu'}`}></div>
          <span>STATUS: {currentStep === 5 ? 'DEPLOYING' : 'CONFIGURING'}</span>
        </div>
      </div>

      {/* Tech Progress Pipeline */}
      <div className="mb-24 relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-linear-to-r from-hydro to-yuzu -translate-y-1/2 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,159,28,0.5)]"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between w-full">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex flex-col items-center group relative z-10">
                
                {/* The Node */}
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center border-2 transform transition-all duration-300
                    ${isActive 
                      ? "bg-black border-yuzu scale-125 shadow-[0_0_20px_rgba(255,159,28,0.3)]" 
                      : isCompleted 
                        ? "bg-hydro/20 border-hydro text-hydro" 
                        : "bg-black border-white/10 text-gray-600"
                    }
                    ${isActive ? "rotate-45 rounded-lg" : "rounded-full"} 
                  `}
                >
                  <div className={`${isActive ? "-rotate-45" : ""} transition-transform`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                </div>

                {/* Labels */}
                <div className={`absolute top-16 flex flex-col items-center text-center w-32 transition-opacity duration-300 ${isActive || isCompleted ? "opacity-100" : "opacity-50"}`}>
                  <span className={`font-mono text-[10px] tracking-widest mb-1 ${isActive ? "text-yuzu" : isCompleted ? "text-hydro" : "text-gray-500"}`}>
                    0{step.number}
                  </span>
                  <span className={`font-sans font-bold text-xs ${isActive ? "text-white" : "text-gray-400"}`}>
                    {step.title}
                  </span>
                  {isActive && (
                     <span className="text-[10px] text-gray-500 font-mono mt-1 hidden md:block">
                       [{step.sub}]
                     </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interface Card */}
      <div className="relative">
        {/* Decorative Corners - Animate with card */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-yuzu/50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-yuzu/50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-yuzu/50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-yuzu/50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>

        <div
          className={`glass-card border border-white/10 bg-panel/50 backdrop-blur-xl p-8 md:p-12 relative overflow-visible
            transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${currentStep === 1 && isTagDropdownOpen ? 'min-h-[800px]' : 'min-h-[500px]'}`}
        >

          {/* Background Grid Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>

          {/* Step Content */}
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 1 && (
              <MetadataStep
                formData={formData}
                updateFormData={updateFormData}
                onTagDropdownOpenChange={setIsTagDropdownOpen}
              />
            )}
            {currentStep === 2 && (
              <AssetLocationStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <PricingStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <ReviewStep formData={formData} />
            )}
            {currentStep === 5 && <DeployProgress formData={formData} txResult={txResult} onComplete={handleDeploymentComplete} />}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="font-mono text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            PREV_STEP
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 font-mono hidden md:block">
              {currentStep === 4 ? "READY TO DEPLOY?" : "DATA INTEGRITY CHECK: PASS"}
            </span>
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed() || loading || isDeploying}
              className={`
                font-mono font-bold border transition-all
                ${canProceed() && !loading && !isDeploying
                  ? "bg-yuzu text-black border-yuzu hover:bg-white hover:border-white shadow-[0_0_15px_rgba(255,159,28,0.3)]" 
                  : "bg-white/5 text-gray-500 border-white/10 cursor-not-allowed"}
              `}
            >
              {loading || isDeploying ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {currentStep === 4 ? "DEPLOYING..." : "PROCESSING..."}
                </>
              ) : (
                <>
                  {currentStep === 4 ? "INITIALIZE_DEPLOY" : "NEXT_STEP"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishWizard;