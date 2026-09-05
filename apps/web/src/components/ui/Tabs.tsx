"use client";

import React, { createContext, useContext } from "react";

interface TabsContextValue {
  activeTab: string;
  onChange: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = "" }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeTab: value, onChange: onValueChange }}>
      <div className={`flex flex-col w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "pill";
}

export function TabList({
  children,
  variant = "line",
  className = "",
  ...props
}: TabListProps) {
  const variantClass =
    variant === "line"
      ? "border-b border-border-color gap-4"
      : "bg-surface-2 p-1 rounded-md border border-border-color gap-1";

  return (
    <div
      role="tablist"
      className={`flex items-center select-none overflow-x-auto ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "line" | "pill";
}

export function TabTrigger({
  value,
  children,
  badge,
  icon,
  variant = "line",
  disabled,
  className = "",
  ...props
}: TabTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  const activeStyles = {
    line: isActive
      ? "text-cyan-400 border-b-2 border-cyan-500 shadow-[0_2px_8px_rgba(0,229,255,0.15)] pb-2 -mb-[1px]"
      : "text-gray-400 hover:text-gray-200 border-b-2 border-transparent pb-2 -mb-[1px]",
    pill: isActive
      ? "bg-surface-elevated text-cyan-400 border border-border-hi shadow-sm"
      : "text-gray-400 hover:text-gray-200 border border-transparent",
  };

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context.onChange(value)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed ${activeStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  );
}

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabContent({ value, children, className = "", ...props }: TabContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`pt-4 outline-none focus:outline-none animate-fadeIn ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
