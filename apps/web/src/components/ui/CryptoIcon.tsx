"use client";
import React, { useState } from "react";
import Image from "next/image";

const COIN_GECKO_MAP: Record<string, { id: number; file: string }> = {
  BTC: { id: 1, file: "bitcoin.png" },
  ETH: { id: 279, file: "ethereum.png" },
  SOL: { id: 4128, file: "solana.png" },
  BNB: { id: 825, file: "bnb-icon2_2x.png" },
  AVAX: { id: 12559, file: "Avalanche_Circle_RedWhite_Trans.png" },
  MATIC: { id: 4713, file: "matic-token-icon.png" },
  POL: { id: 4713, file: "matic-token-icon.png" },
  ADA: { id: 975, file: "cardano.png" },
  DOT: { id: 12171, file: "polkadot.png" },
  LINK: { id: 877, file: "chainlink-new-logo.png" },
  ARB: { id: 16547, file: "photo_2023-03-29_21.47.00.jpeg" },
  OP: { id: 25244, file: "Optimism.png" },
  DOGE: { id: 5, file: "dogecoin.png" },
  XRP: { id: 44, file: "xrp-symbol-white-128.png" },
  LTC: { id: 2, file: "litecoin.png" },
  UNI: { id: 12504, file: "uniswap-uni-logo.png" },
  AAVE: { id: 12645, file: "aave-logo.png" },
  SUI: { id: 26375, file: "sui.png" },
  TON: { id: 17980, file: "ton_symbol.png" },
  USDT: { id: 325, file: "Tether.png" },
  USDC: { id: 6319, file: "USD_Coin_icon.png" },
};

const SIZE_MAP = { sm: 20, md: 24, lg: 32, xl: 40 };

function getBaseSymbol(symbol: string): string {
  return symbol.split("/")[0].toUpperCase();
}

function getFallbackColor(symbol: string): string {
  const colors = ["#334155","#1e3a5f","#1a3a2a","#3a1a1a","#2a1a3a"];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export interface CryptoIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showName?: boolean;
}

export function CryptoIcon({ symbol, size = "md", className = "", showName = false }: CryptoIconProps) {
  const [imgError, setImgError] = useState(false);
  const base = getBaseSymbol(symbol);
  const coin = COIN_GECKO_MAP[base];
  const px = SIZE_MAP[size];
  const url = coin ? `https://assets.coingecko.com/coins/images/${coin.id}/small/${coin.file}` : null;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="inline-flex items-center justify-center rounded-full overflow-hidden shrink-0"
        style={{ width: px, height: px }}
      >
        {url && !imgError ? (
          <Image
            src={url}
            alt={base}
            width={px}
            height={px}
            className="rounded-full"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <span
            className="flex items-center justify-center w-full h-full rounded-full text-gray-200 font-bold"
            style={{ fontSize: px * 0.4, backgroundColor: getFallbackColor(base) }}
          >
            {base.slice(0, 2)}
          </span>
        )}
      </span>
      {showName && <span className="text-xs text-gray-300 font-sans">{base}</span>}
    </span>
  );
}
