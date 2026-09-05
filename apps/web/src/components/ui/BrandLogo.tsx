"use client";

import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "vector" | "emblem";
  showText?: boolean;
}

const sizeMap = {
  sm: 26,
  md: 32,
  lg: 40,
  xl: 64,
};

export function BrandLogo({
  size = "md",
  className = "",
  variant = "vector",
  showText = false,
}: BrandLogoProps) {
  const px = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 rounded-lg overflow-hidden shadow-[0_0_14px_rgba(0,229,255,0.2)] border border-cyan-500/30"
        style={{ width: px, height: px }}
      >
        {variant === "emblem" ? (
          <Image
            src="/brand/logo.jpg"
            alt="AGI Trading Logo"
            width={px}
            height={px}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <Image
            src="/brand/logo.svg"
            alt="AGI Trading Mark"
            width={px}
            height={px}
            className="w-full h-full object-contain bg-black"
            priority
          />
        )}
      </div>

      {showText && (
        <div className="flex flex-col tracking-wider select-none font-mono">
          <span className="text-[11px] font-bold text-gray-300 leading-none">AGI</span>
          <span className="text-xs font-bold text-cyan-400 leading-none">TRADING</span>
        </div>
      )}
    </div>
  );
}
