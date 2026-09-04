"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  className = "",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[size];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-950/85 backdrop-blur-[2px] animate-fadeIn"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full rounded-lg bg-surface-elevated border border-border-hi shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${sizeClasses} ${className}`}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-border-color bg-surface">
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-gray-100 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <IconButton
              icon={<X size={15} />}
              aria-label="Close dialog"
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 text-xs text-gray-300">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-color bg-surface">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
