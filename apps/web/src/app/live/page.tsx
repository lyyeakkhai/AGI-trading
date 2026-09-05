import { LiveTradingWorkspace } from "@/components/live/LiveTradingWorkspace";

export const metadata = {
  title: "Live Trading Controls & Safety | AGI Trading",
  description: "Controlled live trading activation gates, dual-signature requirements, and emergency kill switch controls.",
};

export default function LiveTradingPage() {
  return <LiveTradingWorkspace />;
}
