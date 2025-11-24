"use client";
import { CheckCircle2, AlertCircle, Clock, Info, ExternalLink, X } from "lucide-react";

import React, { useEffect, useState } from "react";
import { ToastType } from "./ToastProvider";

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); 
  };

  const typeConfig = {
    success: {
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      textColor: "text-success",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    error: {
      bgColor: "bg-error/10",
      borderColor: "border-error/30",
      textColor: "text-error",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    pending: {
      bgColor: "bg-pending/10",
      borderColor: "border-pending/30",
      textColor: "text-pending",
      icon: <Clock className="w-5 h-5" />,
    },
    info: {
      bgColor: "bg-info/10",
      borderColor: "border-info/30",
      textColor: "text-info",
      icon: <Info className="w-5 h-5" />,
    },
  };

  const config = typeConfig[toast.type];

  const getExplorerUrl = (txHash: string) => {
    // Default to Polygon explorer, can be made dynamic based on chain
    return `https://polygonscan.com/tx/${txHash}`;
  };

  return (
    <div
      className={`glass-card ${config.bgColor} border ${config.borderColor} p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.textColor} shrink-0 mt-0.5`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm text-white mb-1">{toast.message}</p>

          {toast.txHash && (
            <a
              href={getExplorerUrl(toast.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-mono text-xs ${config.textColor} hover:underline flex items-center gap-1`}
            >
              View on Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pending spinner */}
      {toast.type === "pending" && (
        <div className="mt-2 flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-pending"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="font-mono text-xs text-gray-400">
            Processing transaction...
          </span>
        </div>
      )}
    </div>
  );
};

export default Toast;
