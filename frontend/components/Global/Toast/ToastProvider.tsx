"use client";

import React, { createContext, useState, useCallback } from "react";
import Toast from "./Toast";

export interface ToastType {
  id: string;
  message: string;
  type: "success" | "error" | "pending" | "info";
  txHash?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (
    message: string,
    type: ToastType["type"],
    txHash?: string,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType["type"],
      txHash?: string,
      duration: number = 5000
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastType = { id, message, type, txHash, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
