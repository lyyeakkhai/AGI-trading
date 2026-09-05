"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, Bot, X } from "lucide-react";

export type ToastType = "info" | "success" | "warning" | "error" | "ai";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastTypeStyles: Record<
  ToastType,
  { container: string; icon: React.ReactNode; border: string }
> = {
  info: {
    container: "bg-surface-elevated border-border-hi text-gray-200",
    icon: <Info size={16} className="text-info shrink-0" />,
    border: "border-l-2 border-l-info",
  },
  success: {
    container: "bg-surface-elevated border-border-hi text-gray-200",
    icon: <CheckCircle2 size={16} className="text-profit shrink-0" />,
    border: "border-l-2 border-l-profit",
  },
  warning: {
    container: "bg-surface-elevated border-border-hi text-gray-200",
    icon: <AlertTriangle size={16} className="text-warning shrink-0" />,
    border: "border-l-2 border-l-warning",
  },
  error: {
    container: "bg-surface-elevated border-border-hi text-gray-200",
    icon: <XCircle size={16} className="text-loss shrink-0" />,
    border: "border-l-2 border-l-loss",
  },
  ai: {
    container: "bg-surface-elevated border-border-hi text-gray-200 shadow-[0_0_12px_rgba(0,229,255,0.15)]",
    icon: <Bot size={16} className="text-cyan-400 shrink-0" />,
    border: "border-l-2 border-l-cyan-500",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const config = toastTypeStyles[toast.type];
          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3 rounded-md border shadow-xl transition-all duration-200 animate-slideUp ${config.container} ${config.border}`}
            >
              {config.icon}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold tracking-tight text-gray-100">
                  {toast.title}
                </div>
                {toast.message && (
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-normal">
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-gray-500 hover:text-gray-300 p-0.5 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
