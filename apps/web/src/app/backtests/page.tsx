import { BacktestsWorkspace } from "@/components/backtests/BacktestsWorkspace";

export const metadata = {
  title: "Backtests | AGI Trading",
  description: "Historical strategy validation, regime stress-testing, and walk-forward quantitative verification.",
};

export default function BacktestsPage() {
  return <BacktestsWorkspace />;
}
