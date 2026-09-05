"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | "divider")[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "left",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[180px] rounded-md bg-surface-elevated border border-border-hi shadow-xl py-1 focus:outline-none animate-fadeIn ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, idx) => {
            if (item === "divider") {
              return (
                <div
                  key={`div-${idx}`}
                  className="my-1 border-t border-border-color"
                />
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition-colors duration-100 ${
                  item.disabled
                    ? "opacity-40 cursor-not-allowed text-gray-500"
                    : item.danger
                    ? "text-loss hover:bg-loss-dim/60"
                    : "text-gray-300 hover:bg-surface-hover hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="font-mono text-[10px] text-gray-500">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
