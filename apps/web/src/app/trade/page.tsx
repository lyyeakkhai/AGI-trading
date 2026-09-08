import { Metadata } from "next";
import { Suspense } from "react";
import { TradingWorkspace } from "@/features/trading/components/TradingWorkspace";

export const metadata: Metadata = {
  title: "Trading Workspace | AGI Trading",
};

export default function TradePage() {
  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6">
      <Suspense fallback={<div>Loading workspace...</div>}><TradingWorkspace /></Suspense>
    </div>
  );
}
